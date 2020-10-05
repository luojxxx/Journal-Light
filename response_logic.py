import random

from starter_logic import generate_journal_starter
from eliza_logic import eliza_analyze
from continuation_logic import generate_generic_continuation, generate_specific_continuation

def generate_response(text_input):
    # Trim and format input
    char_limit = 1000
    text = text_input[-char_limit:]
    sentence_list = [sentence.strip() for sentence in text.split('.') if sentence != '']
    
    if len(text_input) > char_limit:
      sentence_list = sentence_list[1:]
    sentence_list = sentence_list[-5:]

    # If input is empty or on a new paragraph, then return a journal starter
    if len(sentence_list) == 0 or sentence_list[-1] == '\n':
        return { 'responseType': 'starter', 'response': generate_journal_starter() }

    # If there's a hit on the eliza matching, return that
    lastSentenceResponse = eliza_analyze(sentence_list[-1])
    if lastSentenceResponse != None:
      return { 'responseType': 'eliza_cont', 'response': lastSentenceResponse } 

    # Randomly pick one of two branchs of continuation responses: generic or specific
    branch = random.randint(0,2)
    if branch == 0:
        return { 'responseType': 'generic_cont', 'response': generate_generic_continuation() }

    if branch == 1 or branch == 2:
        return {'response_type': 'specific_cont', 'response': generate_specific_continuation(text) }
