import random

from sentiment_logic import analyze_sentiment, analyze_entity_sentiment
from summarize_logic import summarize

def generate_generic_continuation():
    continuations = [
      "Please tell me more.",
      "Can you elaborate on that?",
      "How come?",
      "Why's that?",
      "What else?",
      "What did you learn?",
      "What does that suggest to you?",
      "I see. And what does that tell you?",
      "How does that make you feel?",
      "How do you feel when you say that?"
    ]
    return random.choice(continuations)

specific_sentence_openers = [
     'Why do you say',
     'Can you tell me how you felt when you said',
     'What did you learn when you said'
    ]

def generate_summary_continuation(text_input):
    summary_main = summarize(text_input)
    if len(summary_main) == 0:
      return None
    return f'{random.choice(specific_sentence_openers)} "{summary_main}"?'

def generate_important_sentence_continuation(text_input):
    #Analyze the summary and the individual sentences of the input for the sentiment magnitude
    sentiment = analyze_sentiment(text_input)
    summary_magnitude = sentiment.document_sentiment.magnitude
    sentence_list_magnitude = [sentence.sentiment.magnitude for sentence in sentiment.sentences]

    # If the individual sentence magnitude is greater than the summary magnitude, it's an important sentence
    important_sentences = []
    for idx, sentence_magnitude in enumerate(sentence_list_magnitude):
        if sentence_magnitude > summary_magnitude:
            important_sentences.append(idx)
    
    if len(important_sentences) == 0:
      return None
    return f'{random.choice(specific_sentence_openers)} "{random.choice(important_sentences)}"?'

specific_entity_openers = [
  'Can you tell me more about',
  'How do you feel about',
  'What did you learn about'
]

def generate_important_entity_continuation(text_input):
    sentiment = analyze_entity_sentiment(text_input)
    entity_magnitudes = [{'name': entity.name, 'magnitude': entity.sentiment.magnitude} for entity in sentiment.entities]
    sorted_entity_magnitudes = sorted(entity_magnitudes, key=lambda entity: entity['magnitude'])
    if len(sorted_entity_magnitudes) == 0:
      return None
    random_important_entity = random.choice(sorted_entity_magnitudes[-3:])['name']
    return f'{random.choice(specific_entity_openers)} "{random_important_entity}"?'

def generate_specific_continuation(text_input):
    continuation_generator = random.choice([
     generate_summary_continuation,
     generate_important_sentence_continuation,
     generate_important_entity_continuation,
    ])
    response = continuation_generator(text_input)
    
    if response == None:
      return generate_generic_continuation()
    return response