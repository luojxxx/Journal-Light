from tkinter import *

import imp
test_responselogic = imp.load_source('test_responselogic.py', '/Users/cloudlife/GitHub/alphatestapp/test_responselogic.py')

# def onclick():
#    pass

def helloCallBack():
   data = text.get(1.0,END)[:-1]
   result = test_responselogic.responselogic(data)
   var.set(result)

root = Tk()
text = Text(root)
# text.insert(INSERT, "Hello.....")
# text.insert(END, "Bye Bye.....")
text.pack()

B = Button(root, text ="Submit", command = helloCallBack)
B.pack()

var = StringVar()
label = Message( root, textvariable=var)
label.pack()

text.tag_add("here", "1.0", "1.4")
text.tag_add("start", "1.8", "1.13")
text.tag_config("here", background="yellow", foreground="blue")
text.tag_config("start", background="black", foreground="green")
root.mainloop()