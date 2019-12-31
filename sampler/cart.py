class Cart:
    def __init__(self, request):
        self.session = request.session
        self.cart = request.session.get('cart', [])
        
    def add_sample(self, sample):
        if not sample.id in self.cart:
            self.cart.append(sample.id)
            self.save()
            return '{} has been added to cart.'.format(sample.id)
        return '{} is already in the cart.'.format(sample.id)
    
    def remove_sample(self, sample):
        if sample.id in self.cart:
            self.cart.remove(sample.id)
            self.save()
            return '{} has been removed from cart.'.format(sample.id)
        return '{} is not in the cart.'.format(sample.id)
        
    def save(self):
        self.session['cart'] = self.cart
