import torchaudio as ta
from torchaudio.transforms import Fade
import torch
import scipy
import wave
import numpy as np
import io

from demucs import pretrained
from demucs.apply import apply_model

from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB_PLUS
from mir_eval import separation

torch.hub.set_dir('./models/')



PATH = "python-server/samples/"
name = "american_idiot"


#model = ta.models.hdemucs_high(["voices", "bass", "drums", "other"]) #ta.models.hdemucs_low(["voices", "bass", "drums", "other"])
# model.eval()

#model = pretrained.get_model(name='light')#'mdx_extra')
#model.eval()

def get_sources():
    return model.sources

def run(mix):

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
        data = out * ref[:, :, start:end].std() + ref[:, :, start:end].mean()

        yield data

        print(start, " to ", end, " of ", length)

        final[:, :, :, start:end] += out
        if start == 0:
            fade.fade_in_len = int(overlap_frames)
            start += int(chunk_len - overlap_frames)
        else:
            start += chunk_len
        end += chunk_len
        if end >= length:
            fade.fade_out_len = 0



def run2(stream, file):
    fname = file.filename
    mix, sr = ta.load(file)

    #y, sr = librosa.load(file_path, sr=16000)
    #mix = torch.tensor([y, y])

    print(mix.size())
    print("file: ", fname)

    #mix = resample(mix, sr, 8000)

    ref = mix.mean(0)
    mix = (mix - ref.mean()) / ref.std()  # normalization

    # sources = separate_sources(
    #     model,
    #     mix[None],
    #     device=device,
    #     segment=10,
    #     overlap=0.1,
    # )[0]
    # with torch.no_grad():
    #     sources = apply_model(model, mix[None], overlap=0.15)[0]
    sources = separate_sources(
        model=model,
        mix=mix[None],
        stream=stream,
        sample_rate=sr,
        device=device
    )[0]
        
    # sources = sources * ref.std() + ref.mean()

    # sources_list = model.sources
    # sources = list(sources)

    # audios = dict(zip(sources_list, sources))

    print(sources_list)
    
    # for n, l in audios.items():
    #     save_wav(fname, n,l)

    # return []


def resample(X, SR, N):
    secs = X.shape[-1] // SR # Number of seconds in signal X
    samps = secs * N     # Number of samples to downsample
    print(secs, samps)
    Y = scipy.signal.resample(X, samps, axis=1)
    return torch.as_tensor(Y)


def test(mix):

    yield bytes([1,2,3])
    yield bytes([1,2,3])
    yield bytes([1,2,3])



def separate_sources(
        _mix,
        sample_rate,
        segment=10.,
        overlap=0.1,
):
    bundle = HDEMUCS_HIGH_MUSDB_PLUS
    model = bundle.get_model()
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model.to(device)
    #sample_rate = bundle.sample_rate

    ref = _mix.mean(0)
    _mix = (_mix - ref.mean()) / ref.std()

    mix = _mix[None]

    print(mix[None].size())

    segment: int = 10
    overlap = 0.1

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
        data = out * ref[start:end].std() + ref[start:end].mean()
        data = torch.flatten(data, start_dim=0, end_dim=2)
        print(data.size())

        yield [t.numpy() for t in data]

        print(start, " to ", end, " of ", length)

        final[:, :, :, start:end] += out
        if start == 0:
            fade.fade_in_len = int(overlap_frames)
            start += int(chunk_len - overlap_frames)
        else:
            start += chunk_len
        end += chunk_len
        if end >= length:
            fade.fade_out_len = 0
    #return final



def save_wav(fname, source, list):
    samplerate = 44100

    # Put the channels together with shape (2, 44100).
    audio = np.array(list).T

    # Convert to (little-endian) 16 bit integers.
    audio = (audio * (2 ** 15 - 1)).astype("<h")

    with wave.open(PATH + fname + "_" + source + ".wav", "w") as f:
        # 2 Channels.
        f.setnchannels(2)
        # 2 bytes per sample.
        f.setsampwidth(2)
        f.setframerate(samplerate)
        f.writeframes(audio.tobytes())


def gen_wav(list, sample_rate):
    # Put the channels together
    
    audio = np.array(list).T

    print(audio.shape)

    # Convert to (little-endian) 16 bit integers.
    audio = (audio * (2 ** 15 - 1)).astype("<h")

    tmp = io.BytesIO()

    with wave.open(tmp, 'wb') as f:
        # 4 Channels.
        f.setnchannels(8)
        # 2 bytes per sample.
        f.setsampwidth(2)
        f.setframerate(sample_rate)
        f.writeframes(audio.tobytes())

    #return audio.tobytes()
    tmp.seek(0)

    return audio.tobytes()

    