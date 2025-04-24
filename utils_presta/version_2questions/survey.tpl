

<div class="survey-container">
<h3 class="survey-question">{l s="Merci %s, qu'est-ce qui vous a convaincu d'acheter chez Seagale ?" sprintf=[$customer.firstname] d='Modules.Seagale'}</h3>
  <form id="surveyForm" action="{$survey_action}" method="post">
    <input type="hidden" name="id_order" value="{$order.details.id}">
    <div>
      <input type="radio" name="id_answer" value="1" id="answer1" required>
      <label for="answer1">{l s='la performance des matières' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="2" id="answer2">
      <label for="answer2">{l s='Les produits éco-conçus' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="3" id="answer3">
      <label for="answer3">{l s="L'univers de la marque" d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="4" id="answer4">
      <label for="answer4">{l s='Le style intemporel' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="5" id="answer5">
      <label for="answer5">{l s='Le rapport qualité/prix' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="6" id="answer6">
      <label for="answer6">{l s='La recommandation par un proche' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="7" id="answer7">
      <label for="answer7">{l s='Autre, précisez :' d='Modules.Seagale'}</label>
      <input type="text" name="autre_answer" id="autre_answer" placeholder="{l s='Votre réponse' d='Modules.Seagale'}" maxlength="255">
    </div>
    <button type="submit" class="survey-button btn btn-primary">{l s='Valider' d='Modules.Seagale'}</button>
  </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const surveyForm = document.getElementById('surveyForm');
  const submitButton = surveyForm.querySelector('button[type="submit"]');
  const autreRadio = document.getElementById('answer7');
  const autreInput = document.getElementById('autre_answer');
  autreInput.style.display = 'none';

  document.querySelectorAll('input[name="id_answer"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === '7'){
        autreInput.style.display = 'inline-block';
        autreInput.required = true;
      } else {
        autreInput.style.display = 'none';
        autreInput.required = false;
      }
    });
  });

  surveyForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(surveyForm);

    // Envoi en AJAX
    fetch("{$survey_action}", {
      method: "POST",
      body: formData,
    })
    .then(response => response.text())
    .then(data => {

      submitButton.textContent = "Merci !";

      submitButton.disabled = true;
    })
    .catch(error => {
      console.error('Erreur:', error);
    });
  });
});
</script>
