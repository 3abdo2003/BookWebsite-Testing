describe('User Story: Register, login, add books to cart or wishlist and checkout', () => {
  let userState = {
    cart: [],
    wishlist: [],
    orders: []
  };

  beforeEach(() => {
    // Mock API for user registration
    cy.intercept('POST', 'http://localhost:5000/api/users/register', (req) => {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        req.reply({
          statusCode: 400,
          body: { message: 'Missing fields' },
        });
      } else {
        req.reply({
          statusCode: 200,
          body: { message: 'Registration successful!' },
        });
      }
    }).as('registerUser');

    // Mock API for user login
    cy.intercept('POST', 'http://localhost:5000/api/users/login', {
      statusCode: 200,
      body: { token: 'mockToken123' },
    }).as('loginUser');

    // Mock API for fetching all books (homepage)
    cy.intercept('GET', 'http://localhost:5000/api/books', {
      statusCode: 200,
      body: [
        {
          _id: '1',
          title: 'Book One',
          author: 'Author One',
          price: 20,
          discount: 10,
          category: 'Fiction',
          images: ['/book-one.jpg'],
        },
      ],
    }).as('getBooks');

    // Mock API for fetching a specific book by ID (detail page)
    cy.intercept('GET', 'http://localhost:5000/api/books/1', {
      statusCode: 200,
      body: {
        _id: '1',
        title: 'Book One',
        author: 'Author One',
        description: 'A captivating story...',
        price: 20,
        discount: 10,
        category: 'Fiction',
        stock: 10,
        images: ['/book-one.jpg'],
      },
    }).as('getBookDetails');

    // Mock API for adding to cart
    cy.intercept('POST', 'http://localhost:5000/api/carts/add', (req) => {
      const { bookId } = req.body;
      if (!bookId) {
        req.reply({
          statusCode: 400,
          body: { message: 'Book ID is required' },
        });
      } else {
        // Check if the book already exists in the cart, if so increment quantity
        const existingCartItem = userState.cart.find(item => item.book._id === bookId);
        if (existingCartItem) {
          existingCartItem.quantity += 1;
        } else {
          userState.cart.push({
            book: {
              _id: bookId,
              title: 'Book One',
              author: 'Author One',
              price: 20,
              images: ['/book-one.jpg'],
            },
            quantity: 1,
          });
        }
        req.reply({
          statusCode: 200,
          body: { message: 'Book added to cart successfully' },
        });
      }
    }).as('addToCart');

    // Mock API for adding to wishlist
    cy.intercept('POST', 'http://localhost:5000/api/wishlist/add', (req) => {
      const { bookId } = req.body;
      if (!bookId) {
        req.reply({
          statusCode: 400,
          body: { message: 'Book ID is required' },
        });
      } else {
        // Add the book to the wishlist if not already present
        if (!userState.wishlist.find(w => w._id === bookId)) {
          userState.wishlist.push({
            _id: bookId,
            title: 'Book One',
            author: 'Author One',
            price: 20,
            images: ['/book-one.jpg'],
          });
        }
        req.reply({
          statusCode: 200,
          body: { message: 'Book added to wishlist successfully' },
        });
      }
    }).as('addToWishlist');

    // Mock API for removing from wishlist
    cy.intercept('DELETE', 'http://localhost:5000/api/wishlist/remove/1', (req) => {
      userState.wishlist = userState.wishlist.filter(item => item._id !== '1');
      req.reply({
        statusCode: 200,
        body: { message: 'Book removed from wishlist successfully' },
      });
    }).as('removeFromWishlist');

    // Mock API for fetching the cart
    cy.intercept('GET', 'http://localhost:5000/api/carts', (req) => {
      req.reply({
        statusCode: 200,
        body: {
          _id: 'mockCartId',
          user: 'mockUserId',
          items: userState.cart,
        },
      });
    }).as('getCart');

    // Mock API for fetching the wishlist
    cy.intercept('GET', 'http://localhost:5000/api/wishlist', (req) => {
      req.reply({
        statusCode: 200,
        body: { books: userState.wishlist },
      });
    }).as('getWishlist');

    // Mock API for user info
    cy.intercept('GET', 'http://localhost:5000/api/users/me', {
      statusCode: 200,
      body: { name: 'John Doe', email: 'john.doe@example.com' }
    }).as('getUserInfo');

    // Mock API for orders checkout (cash)
    cy.intercept('POST', 'http://localhost:5000/api/orders/checkout', (req) => {
      const { shippingAddress, phoneNumber } = req.body;
      if (!shippingAddress || !phoneNumber) {
        req.reply({
          statusCode: 400,
          body: { message: 'Missing shipping address or phone number' }
        });
      } else {
        // Simulate order creation
        const order = {
          orderId: 'order123',
          status: 'Processing',
          totalPrice: 20,
          items: [
            { bookTitle: 'Book One', quantity: userState.cart.reduce((sum, item) => sum + item.quantity, 0) }
          ]
        };
        userState.orders.push(order);

        // Clear the cart after checkout
        userState.cart = [];

        req.reply({
          statusCode: 200,
          body: { message: 'Order placed successfully!' }
        });
      }
    }).as('checkoutOrder');

    // Mock API for fetching user orders
    cy.intercept('GET', 'http://localhost:5000/api/orders/user-orders', (req) => {
      req.reply({
        statusCode: 200,
        body: userState.orders
      });
    }).as('getUserOrders');

    // Start from the register page
    cy.visit('/register');
  });

  it('Allows a new user to register, then login, add a book to the wishlist, view the wishlist, add to cart, checkout with cash, and verify the order and wishlist in the profile page', () => {
    // Fill out the registration form
    cy.get('#name').type('John Doe');
    cy.get('#email').type('john.doe@example.com');
    cy.get('#password').type('password123');
    cy.get('#confirmPassword').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@registerUser').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      cy.url().should('include', '/login?registered=true');
    });

    // Now login
    cy.get('#email').type('john.doe@example.com');
    cy.get('#password').type('password123');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginUser').then(() => {
      // Set token before visiting the homepage
      localStorage.setItem('token', 'mockToken123');
      cy.visit('/');
    });

    // Ensure books are fetched
    cy.wait('@getBooks').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    // Verify the book is visible on the homepage
    cy.contains('Book One').should('be.visible');

    // Add the book to the wishlist from the homepage
    cy.contains('Wishlist').should('be.visible').click();
    cy.wait('@addToWishlist').then((interception) => {
      expect(interception.request.body).to.have.property('bookId', '1');
      expect(interception.response.statusCode).to.eq(200);
      expect(userState.wishlist).to.deep.include({
        _id: '1',
        title: 'Book One',
        author: 'Author One',
        price: 20,
        images: ['/book-one.jpg'],
      });
    });

    // Immediately view the wishlist after adding the book
    cy.visit('/profile');
    // Wait for the actual endpoints related to the profile page
    cy.wait('@getUserOrders');
    cy.wait('@getWishlist');
    cy.contains('Your Wishlist').click();
    cy.contains('Book One').should('be.visible');

    // Add the book to the cart from the homepage (go back to homepage)
    cy.visit('/');
    cy.contains('Add to Cart').should('be.visible').click();
    cy.wait('@addToCart').then((interception) => {
      expect(interception.request.body).to.have.property('bookId', '1');
      expect(interception.response.statusCode).to.eq(200);
      expect(userState.cart).to.deep.include({
        book: {
          _id: '1',
          title: 'Book One',
          author: 'Author One',
          price: 20,
          images: ['/book-one.jpg'],
        },
        quantity: 1,
      });
    });

    // Navigate to the book details page by clicking on the book title
    cy.contains('Book One').click();
    cy.wait('@getBookDetails').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    // On the book detail page, the book is already on the wishlist, so the button should show "Remove from Wishlist"
    cy.contains('Remove from Wishlist').should('be.visible');

    // Remove it from the wishlist from the book detail page
    cy.contains('Remove from Wishlist').click();
    cy.wait('@removeFromWishlist').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(userState.wishlist).to.have.length(0); // Wishlist should now be empty
    });

    // Add to cart again from the book detail page
    cy.contains('Add to Cart').click();
    cy.wait('@addToCart').then((interception) => {
      expect(interception.request.body).to.have.property('bookId', '1');
      // This should add another quantity of the same book to the cart
      const cartItem = userState.cart.find(item => item.book._id === '1');
      expect(cartItem.quantity).to.eq(2);
    });

    // Now proceed to checkout
    cy.visit('/checkout');
    cy.wait('@getCart').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      // Cart should have the book with quantity 2 now
      expect(interception.response.body.items[0].quantity).to.eq(2);
    });

    // Fill in shipping details and select cash payment
    cy.get('input[placeholder="Shipping Address"]').type('123 Main St');
    cy.get('input[placeholder="Phone Number"]').type('1234567890');
    cy.get('select').select('cash');

    // Confirm order
    cy.contains('Confirm Order').click();
    cy.wait('@checkoutOrder').then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
      expect(interception.response.body.message).to.eq('Order placed successfully!');
      expect(userState.orders).to.have.length(1);
      // Cart should be cleared after checkout
      expect(userState.cart).to.have.length(0);
    });

    // After successful checkout, user is redirected to profile page
    cy.url().should('include', '/profile');
    cy.wait('@getUserOrders');
    cy.wait('@getWishlist');

    // Verify orders are displayed on the profile page
    cy.contains('Your Orders').click();
    cy.contains('Order #order123').should('be.visible');
    cy.contains('Book One (x2)').should('be.visible');
    cy.contains('Total: $20.00').should('be.visible'); 

    // Verify wishlist is empty since we removed the book from wishlist on the detail page
    cy.contains('Your Wishlist').click();
    cy.contains('Your wishlist is empty.').should('be.visible');
  });
});
