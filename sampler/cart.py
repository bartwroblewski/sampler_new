class Cart:
    def __init__(self, request):
        self.session = request.session
        self.cart = unjsonify(request.session.get('cart', {}))
        
    def add_sample(self, sample):
        self.cart[sample.id] = {
            'name': sample.file.name,
            'path': sample.file.path,
        }
        self.save()
    
    def remove_sample(self, sample):
        del self.cart[sample.id]
        self.save()
        
    def save(self):
        self.session['cart'] = self.cart
            

def unjsonify(dictionary):
    '''Reverts session's default JSON conversion'''
    unjsonified = {}
    for k, v in dictionary.items():
        if isinstance(k, str):
            k = int(k)
        unjsonified[k] = v
    return unjsonified
