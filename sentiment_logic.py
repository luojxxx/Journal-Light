import os

from google.cloud import language_v1
from google.cloud.language_v1 import enums

scriptpath = os.path.dirname(os.path.realpath(__file__))

os.environ['GOOGLE_APPLICATION_CREDENTIALS'] =  os.path.join(scriptpath, 'google_api_creds.json')

def analyze_sentiment(text_content):
    client = language_v1.LanguageServiceClient()
    document = {"content": text_content, "type": enums.Document.Type.PLAIN_TEXT, "language": "en"}
    # Available values: NONE, UTF8, UTF16, UTF32
    encoding_type = enums.EncodingType.UTF8

    response = client.analyze_sentiment(document, encoding_type=encoding_type)

    return response
    # # Get overall sentiment of the input document
    # print(u"Document sentiment score: {}".format(response.document_sentiment.score))
    # print(
    #     u"Document sentiment magnitude: {}".format(
    #         response.document_sentiment.magnitude
    #     )
    # )
    # # Get sentiment for all sentences in the document
    # for sentence in response.sentences:
    #     print(u"Sentence text: {}".format(sentence.text.content))
    #     print(u"Sentence sentiment score: {}".format(sentence.sentiment.score))
    #     print(u"Sentence sentiment magnitude: {}".format(sentence.sentiment.magnitude))

def analyze_entity_sentiment(text_content):
    client = language_v1.LanguageServiceClient()
    document = {"content": text_content, "type": enums.Document.Type.PLAIN_TEXT, "language": "en"}
    # Available values: NONE, UTF8, UTF16, UTF32
    encoding_type = enums.EncodingType.UTF8

    response = client.analyze_entity_sentiment(document, encoding_type=encoding_type)
    
    return response
    # # Loop through entitites returned from the API
    # for entity in response.entities:
    #     print(u"Representative name for the entity: {}".format(entity.name))
    #     # Get entity type, e.g. PERSON, LOCATION, ADDRESS, NUMBER, et al
    #     print(u"Entity type: {}".format(enums.Entity.Type(entity.type).name))
    #     # Get the salience score associated with the entity in the [0, 1.0] range
    #     print(u"Salience score: {}".format(entity.salience))
    #     # Get the aggregate sentiment expressed for this entity in the provided document.
    #     sentiment = entity.sentiment
    #     print(u"Entity sentiment score: {}".format(sentiment.score))
    #     print(u"Entity sentiment magnitude: {}".format(sentiment.magnitude))
    #     # Loop over the metadata associated with entity. For many known entities,
    #     # the metadata is a Wikipedia URL (wikipedia_url) and Knowledge Graph MID (mid).
    #     # Some entity types may have additional metadata, e.g. ADDRESS entities
    #     # may have metadata for the address street_name, postal_code, et al.
    #     for metadata_name, metadata_value in entity.metadata.items():
    #         print(u"{} = {}".format(metadata_name, metadata_value))

    #     # Loop over the mentions of this entity in the input document.
    #     # The API currently supports proper noun mentions.
    #     for mention in entity.mentions:
    #         print(u"Mention text: {}".format(mention.text.content))
    #         # Get the mention type, e.g. PROPER for proper noun
    #         print(
    #             u"Mention type: {}".format(enums.EntityMention.Type(mention.type).name)
    #         )

    # # Get the language of the text, which will be the same as
    # # the language specified in the request or, if not specified,
    # # the automatically-detected language.
    # print(u"Language of the text: {}".format(response.language))