

<div class="survey-container">
<h3 class="survey-question">{l s='Merci %s, comment nous avez-vous découverts ?' sprintf=[$customer.firstname] d='Modules.Seagale'}</h3>
  <form id="surveyForm" action="{$survey_action}" method="post">
    <input type="hidden" name="id_order" value="{$order.details.id}">
    <div>
      <input type="radio" name="id_answer" value="1" id="answer1" required>
      <label for="answer1">{l s='Bouche à oreille (famille, amis etc.)' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="2" id="answer2">
      <label for="answer2">{l s='Boutique physique (Paris, Lyon, Nice, Toulon)' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="3" id="answer3">
      <label for="answer3">{l s='Moteur de recherche (Google, Bing, etc.)' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="4" id="answer4">
      <label for="answer4">{l s='Réseaux sociaux (Facebook, Instagram, etc.)' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="5" id="answer5">
      <label for="answer5">{l s='LinkedIn' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="6" id="answer6">
      <label for="answer6">{l s='Youtube' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="7" id="answer7">
      <label for="answer7">{l s='Article de presse, podcast, blog' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="8" id="answer8">
      <label for="answer8">{l s='Influenceurs' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="9" id="answer9">
      <label for="answer9">{l s='Autre, précisez :' d='Modules.Seagale'}</label>
      <input type="text" name="autre_answer" id="autre_answer" placeholder="{l s='Votre réponse' d='Modules.Seagale'}" maxlength="255">
    </div>
    <button type="submit" class="survey-button btn btn-primary">{l s='Valider' d='Modules.Seagale'}</button>
  </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const surveyForm = document.getElementById('surveyForm');
  const submitButton = surveyForm.querySelector('button[type="submit"]');
  const autreRadio = document.getElementById('answer9');
  const autreInput = document.getElementById('autre_answer');
  autreInput.style.display = 'none';

  document.querySelectorAll('input[name="id_answer"]').forEach(radio => {
    radio.addEventListener('change', function() {
      if (this.value === '9'){
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
