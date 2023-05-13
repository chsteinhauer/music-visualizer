from torchaudio.transforms import Fade
import torch

from torchaudio.pipelines import HDEMUCS_HIGH_MUSDB_PLUS




def separate_sources(
        _mix,
        sample_rate,
):
    bundle = HDEMUCS_HIGH_MUSDB_PLUS
    model = bundle.get_model()
    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model.to(device)

    ref = _mix.mean(0)
    _mix = (_mix - ref.mean()) / ref.std()

    mix = _mix[None]

    print(mix[None].size())

    segment: int = 10
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


    