import random
import os
import io

scriptpath = os.path.dirname(os.path.realpath(__file__))

def readFile(filepath):
    with io.open(filepath, 'r', encoding='utf8') as f:
        content = f.read().splitlines()
    return content

def generate_journal_starter():
    journalStarters = readFile( os.path.join(scriptpath, 'misc', 'journalstarters.txt') )
    randomStarter = random.choice(journalStarters)
    return randomStarter