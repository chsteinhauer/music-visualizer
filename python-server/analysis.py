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

