import crepe

def detect(audio, sample_rate):
    time, frequency, confidence, activation = crepe.predict(audio, sample_rate, viterbi=True)

    return list([time, frequency])