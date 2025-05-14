

<div class="survey-container">
<h3 class="survey-question">{l s="Merci %s, quel est votre réseau social favori ?" sprintf=[$customer.firstname] d='Modules.Seagale'}</h3>
  <form id="surveyForm" action="{$survey_action}" method="post">
    <input type="hidden" name="id_order" value="{$order.details.id}">

    <div>
      <input type="radio" name="id_answer" value="1" id="answer1" required>
      <label for="answer1">{l s='Linkedin' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="2" id="answer2">
      <label for="answer2">{l s='TikTok' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="3" id="answer3">
      <label for="answer3">{l s='Facebook' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="4" id="answer4">
      <label for="answer4">{l s='Instagram' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="5" id="answer5">
      <label for="answer5">{l s='X (ex-Twitter)' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="6" id="answer6">
      <label for="answer6">{l s='Youtube' d='Modules.Seagale'}</label>
    </div>
    <div>
      <input type="radio" name="id_answer" value="7" id="answer7">
      <label for="answer7">{l s="Je n'ai aucun réseau social" d='Modules.Seagale'}</label>
    </div>

    <button type="submit" class="survey-button btn btn-primary">
      {l s='Valider' d='Modules.Seagale'}
    </button>
  </form>
</div>

<script>
document.addEventListener('DOMContentLoaded', function() {
  const surveyForm = document.getElementById('surveyForm');
  const submitButton = surveyForm.querySelector('button[type="submit"]');

  surveyForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(surveyForm);

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
