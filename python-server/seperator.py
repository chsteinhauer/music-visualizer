from torchaudio.transforms import Fade
import torch
import torchaudio as ta
import numpy as np
import soundfile
from demucs import pretrained
from demucs.apply import apply_model
import noisereduce as nr
import glob
import os

from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB_PLUS


def separate_sources_generator(
        _mix,
        sample_rate,
):
    # this section is kindly inspired by torchaudio's own tutorial:
    # https://pytorch.org/audio/main/tutorials/hybrid_demucs_tutorial.html
    bundle = HDEMUCS_HIGH_MUSDB_PLUS
    model = bundle.get_model()
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model.to(device)

    # normalize the mixture
    ref = _mix.mean(0)
    _mix = (_mix - ref.mean()) / ref.std()

    mix = _mix[None]

    print(mix[None].size())

    segment: int = 5
    overlap = 0.2

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

    while start < length - overlap_frames:
        chunk = mix[:, :, start:end]
        with torch.no_grad():
            out = model.forward(chunk)

        out = fade(out)
        data = out * ref[start:end].std() + ref[start:end].mean()
        data = torch.flatten(data, start_dim=0, end_dim=2)
        
        # Make up for overlapping frames
        leftover = int(overlap_frames) % 2
        fhalf = int(int(overlap_frames) / 2)

        if start == 0:
            data = data[:, 0:-fhalf + leftover]
            fade.fade_in_len = int(overlap_frames)
            start += int(chunk_len - overlap_frames)
        else:
            data = data[:, fhalf:-fhalf + leftover]
            start += chunk_len
        end += chunk_len
        if end >= length:
            data = data[:, fhalf:]
            fade.fade_out_len = 0

        print(data.size())
        print(start, " to ", end, " of ", length)

        yield [t.numpy() for t in data]



def setup_pretrained_model():
    torch.hub.set_dir('./models/')

    model = pretrained.get_model(name='mdx_extra')
    model.eval()

    return model

def seperate_sources_wav(model, mix):
    # Normalize track
    mono = mix.mean(0)
    mean = mono.mean()
    std = mono.std()
    _mix = (mix - mean) / std
    # Separate
    with torch.no_grad():
        sources = apply_model(model, _mix[None], overlap=0.15)[0]

    sources = sources * std + mean

    return sources

    

def generate_samples():
    snippets = os.listdir("./python-server/snippets/")#glob.glob("./python-server/snippets/*.wav")
    print(snippets)

    model = setup_pretrained_model()

    PATH = "./python-server/snippets/"
    OUT_PATH = "./python-server/samples/"
    for file in snippets:
        mix, rate = ta.load(PATH + str(file))
        print(mix.size())

        print("begin " + file)
        sources = seperate_sources_wav(model, mix)
        sources = torch.flatten(sources, start_dim=0, end_dim=1)
        sources = torch.cat((sources, mix), 0)
        print(sources.size())
        
        print(sources.size())
        sources = [t.numpy() for t in sources]

        audio = np.array(sources).T
        audio = (audio * (2 ** 15 - 1)).astype("<h")
        soundfile.write(OUT_PATH  + file, audio, rate)

        print("end " + file)

