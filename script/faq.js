document.addEventListener('DOMContentLoaded', () => {
    const faqQuestions = document.querySelectorAll('.faq-question');

    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');

            // Ferme toutes les réponses actives
            document.querySelectorAll('.faq-question.active').forEach(activeQuestion => {
                if (activeQuestion !== question) {
                    activeQuestion.classList.remove('active');
                    activeQuestion.nextElementSibling.classList.remove('active');
                }
            });

            // Bascule l'état actif de la question cliquée
            question.classList.toggle('active');
            answer.classList.toggle('active');
        });
    });
});
