// FAQ Accordion functionality
const faqButtons = document.querySelectorAll('.faq-button');

faqButtons.forEach(button => {
  button.addEventListener('click', () => {
    const faqItem = button.parentElement;
    const isOpen = faqItem.classList.contains('open');
    
    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(item => {
      if (item !== faqItem && item.classList.contains('open')) {
        item.classList.remove('open');
      }
    });
    
    // Toggle current item
    faqItem.classList.toggle('open');
  });
});
