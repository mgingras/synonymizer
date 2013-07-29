# Synonymizer
#####[ *si-non-uh-mahyz-er* ]

***

Program to take inputted text and substitute words within it with their synonyms.

Written in node

***

###To-Do:

- [x] Find Thesaurus API   
- [x] Set up HTML UI, with text box on left, button in middle, output on right   
- [x] Use JQuery to register event listeners   
- [x] Use JQuery to modify paragraph on right hand side so that it mirrors text in box   
- [x] Basic request for synonyms   
- [x] Pass data from web application to server and get response back   
- [x] Modify the output field on the right with synonymized data   
- [x] Better(ish) picking response words (now randomly choses amongst responses that match gramatical context)   
- [x] Implement natural language recognition and replace words with valid synonym (verb, noun, adjective) (currently just replace with whichever has data(stupid))   
- [ ] On client side when sending queries cast to lowercase   
- [ ] When getting back upercase if after a punctuation point   
- [ ] Get rid of unused css styles   
- [ ] Add media conditions in order to optimize for mobile (looks bad on iphone and ipad atm, probably looks bad on other devices as well)   



Props to Andrew LeBlanc for his JS natural language API: [Stanford Natural Language Parser](http://nlp.naturalparsing.com/documentation)

Code pushed to heroku dev environment: [http://synonymizer.herokuapp.com/](http://synonymizer.herokuapp.com/)

See my writeup about the experience on [magingras.com](http://magingras.com/coding/Synonymizer/)
