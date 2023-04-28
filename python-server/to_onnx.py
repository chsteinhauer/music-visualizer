import sys
sys.path.append("../DNN-based_source_separation/src")
import torchaudio
import torch

from models.conv_tasnet import ConvTasNet
from models.mm_dense_lstm import MMDenseLSTM, ParallelMMDenseLSTM
from models.umx import OpenUnmix, ParallelOpenUnmix
from models.xumx import CrossNetOpenUnmix
from models.d3net import D3Net, ParallelD3Net

#model = ParallelD3Net.build_from_pretrained(task="musdb18", sample_rate=44100)
# model = CrossNetOpenUnmix.build_from_pretrained(task="musdb18", sample_rate=44100)
# model = ConvTasNet.build_from_pretrained(task="musdb18", sample_rate=44100)

model = ConvTasNet.build_from_pretrained(task="musdb18", sample_rate=44100)
#model = ParallelOpenUnmix.build_from_pretrained(task="musdb18", sample_rate=44100)
#wrapper_model = ParallelOpenUnmix.TimeDomainWrapper(model, n_fft=model.n_fft, hop_length=model.hop_length, window_fn=model.window_fn)
model.eval()

dummy_input = torch.randn(1, 1, 2, 256)

#n_bins = model.n_fft // 2 + 1
#dummy_input = torch.abs(torch.randn(1, 1, 2, n_bins, 256))
torch.onnx.export(model, dummy_input, "conv_tasnet.onnx", opset_version=17)

# from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB
# from mir_eval import separation

# bundle = HDEMUCS_HIGH_MUSDB
# model = bundle.get_model()


#     # from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB_PLUS
#     # from mir_eval import separation

#     # bundle = HDEMUCS_HIGH_MUSDB_PLUS
#     # model = bundle.get_model()

# # device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
# # model.to(device)
# model.eval();


# dummy_input = torch.randn(1, 2, 1024)
# torch.onnx.export(model, dummy_input, "hdemucs.onnx", opset_version=17)




# from demucs import pretrained
# from demucs.apply import apply_model

# torch.hub.set_dir('./models/')
# model = pretrained.get_model(name='mdx_extra')
# device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
# model.to(device)


# dummy_input = torch.randn(1, 2, 1024)
# state_dict = torch.load('./xumx_slicq_v2.pth')
# model.load_state_dict(state_dict)
# torch.onnx.export(model, dummy_input, "unmix.onnx", opset_version=17)

