import torchaudio as ta
from torchaudio.transforms import Fade
import torch
import scipy

torch.hub.set_dir('./models/')
device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")

model = ta.models.hdemucs_low(["voices", "bass", "drums", "other"])
model.eval()

def get_sources():
    return model.sources

def run(file_path):
    mix, sr = ta.load(str(file_path))
    print("file: ", file_path)

    mono = mix.mean(0)
    mean = mono.mean()
    std = mono.std()
    mix = (mix - mean) / std

    mix = resample(mix, sr, 8000)

    estimates = separate_sources(
        model,
        mix[None],
        device=device,
    )[0]

    estimates = estimates * std + mean

    print(estimates.size())
    sources_list = model.sources
    print(sources_list)
    
    return estimates.tolist()


def resample(X, SR, N):
    secs = X.shape[-1] // SR # Number of seconds in signal X
    samps = secs * N     # Number of samples to downsample
    print(secs, samps)
    Y = scipy.signal.resample(X, samps, axis=1)
    return torch.as_tensor(Y)



def separate_sources(
        model,
        mix,
        sample_rate=8000,
        segment=10.,
        overlap=0.1,
        device=None,
):

    if device is None:
        device = mix.device
    else:
        device = torch.device(device)

    batch, channels, length = mix.shape

    chunk_len = int(sample_rate * segment * (1 + overlap))
    start = 0
    end = chunk_len
    overlap_frames = overlap * sample_rate
    fade = Fade(fade_in_len=0, fade_out_len=int(overlap_frames), fade_shape='linear')

    final = torch.zeros(batch, len(model.sources), channels, length, device=device)

    while start < length - overlap_frames:
        chunk = mix[:, :, start:end]
        with torch.no_grad():
            out = model.forward(chunk)
        out = fade(out)
        final[:, :, :, start:end] += out
        if start == 0:
            fade.fade_in_len = int(overlap_frames)
            start += int(chunk_len - overlap_frames)
        else:
            start += chunk_len
        end += chunk_len
        if end >= length:
            fade.fade_out_len = 0
    return final
