describe('Sample Test', () => {
    it('Visits the homepage and checks the title', () => {
      // Replace with your app's local or live URL
      cy.visit('http://localhost:3001');
  
      // Check if the title contains specific text
      cy.title().should('include', 'Your App Title'); 
    });
  });
  