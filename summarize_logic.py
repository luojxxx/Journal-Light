from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer as Summarizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

import nltk
nltk.data.path.append('/nltk_data')

# Sumy specific code
def summarize(text):
    LANGUAGE = "english"
    stemmer = Stemmer(LANGUAGE)
    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(LANGUAGE)

    parser = PlaintextParser(text, Tokenizer(LANGUAGE))
    summary_main = [str(sentence) for sentence in summarizer(parser.document, 1)]
    summary_main = str(' '.join(summary_main))
    return summary_main