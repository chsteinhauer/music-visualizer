import sys
sys.path.append("../DNN-based_source_separation/src")
import torch

from models.conv_tasnet import ConvTasNet
from models.mm_dense_lstm import MMDenseLSTM, ParallelMMDenseLSTM
from models.umx import OpenUnmix, ParallelOpenUnmix
from models.xumx import CrossNetOpenUnmix
from models.d3net import D3Net, ParallelD3Net


#model = ParallelD3Net.build_from_pretrained(task="musdb18", sample_rate=44100)
# model = CrossNetOpenUnmix.build_from_pretrained(task="musdb18", sample_rate=44100)
model = ConvTasNet.build_from_pretrained(task="musdb18", sample_rate=44100)#config["sample_rate"])
model.eval()

def sources():
    return model.sources

def seperate_batch(input):
    # mix = torch.tensor([[input,input]], dtype=torch.float).unsqueeze(dim=0)
    # with torch.no_grad():
    #     output = model(mix)
    #print(output.size())
    
    #return output.tolist()
    return [[[input,input],[input,input],[input,input],[input,input]]]


import wave
import numpy as np

def save_wav(t, sources):
    samplerate = 44100

    tracks = t.numpy()
    print(tracks)
    for t in tracks:

        # Put the channels together with shape (2, 44100).
        audio = t.T

        # Convert to (little-endian) 16 bit integers.
        audio = (audio * (2 ** 15 - 1)).astype("<h")

        with wave.open("sound1.wav", "w") as f:
            # 2 Channels.
            f.setnchannels(2)
            # 2 bytes per sample.
            f.setsampwidth(2)
            f.setframerate(samplerate)
            f.writeframes(audio.tobytes())



    

    # with wave.open("sound2.wav", "w") as f:
    #     f.setnchannels(2)
    #     f.setsampwidth(2)
    #     f.setframerate(samplerate)
    #     for samples in zip(left_channel, right_channel):
    #         for sample in samples:
    #             sample = int(sample * (2 ** 15 - 1))
    #             f.writeframes(struct.pack("<h", sample))
