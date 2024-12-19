describe('User Registration', () => {
    beforeEach(() => {
      cy.visit('/register'); // Replace with your registration page route
    });
  
    it('Displays error for mismatched passwords', () => {
      cy.get('#name').type('John Doe');
      cy.get('#email').type('john.doe@example.com');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password321');
      cy.get('button[type="submit"]').click();
  
      cy.contains("Passwords don't match").should('be.visible');
    });
  
    it('Registers successfully and redirects to login', () => {
      cy.intercept('POST', 'http://localhost:5000/api/users/register', {
        statusCode: 201,
        body: { message: 'User registered successfully' },
      }).as('registerUser');
  
      cy.get('#name').type('John Doe');
      cy.get('#email').type('john.doe@example.com');
      cy.get('#password').type('password123');
      cy.get('#confirmPassword').type('password123');
      cy.get('button[type="submit"]').click();
  
      cy.wait('@registerUser');
      cy.url().should('include', '/login?registered=true');
    });
  });
  