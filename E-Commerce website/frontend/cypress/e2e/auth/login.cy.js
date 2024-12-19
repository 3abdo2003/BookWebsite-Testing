describe('User Login', () => {
    beforeEach(() => {
      cy.visit('/login'); // Replace with your login page route
    });
  
    it('Displays error for invalid credentials', () => {
      cy.intercept('POST', 'http://localhost:5000/api/users/login', {
        statusCode: 401,
        body: { message: 'Invalid credentials' },
      }).as('loginUser');
  
      cy.get('#email').type('invalid@example.com');
      cy.get('#password').type('wrongpassword');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@loginUser');
      cy.contains('Invalid credentials').should('be.visible');
    });
  
    it('Logs in successfully and redirects to home', () => {
      cy.intercept('POST', 'http://localhost:5000/api/users/login', {
        statusCode: 200,
        body: { token: 'mockToken123' },
      }).as('loginUser');
  
      cy.get('#email').type('john.doe@example.com');
      cy.get('#password').type('password123');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@loginUser').then((interception) => {
        expect(localStorage.getItem('token')).to.eq('mockToken123');
      });
      cy.url().should('eq', 'http://localhost:3001/'); // Replace with your home page route
    });
  });
  