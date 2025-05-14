<?php

class SeagaleSurveyModuleFrontController extends ModuleFrontController
{
    public function initContent()
    {
        parent::initContent();
        
        
        if (Tools::isSubmit('id_answer')) {
            
            $id_answer = (int)Tools::getValue('id_answer');
            $autre_answer = Tools::getValue('autre_answer'); 

            
            $autre_answer_clean = ($id_answer === 9 && !empty($autre_answer)) ? pSQL($autre_answer) : null;

            // Récupérer les informations du client
            $id_customer = (int)$this->context->customer->id;
            $customer = new Customer($id_customer);
            $name = pSQL($customer->firstname . ' ' . $customer->lastname);
            if ($customer->id_gender == 7) {
                $sexe = 'M';
            } elseif ($customer->id_gender == 8) {
                $sexe = 'F';
            } else {
                $sexe = 'N/A';
            }
            $age = null;
            if (!empty($customer->birthday) && $customer->birthday != '0000-00-00') {
                $birthDate = new DateTime($customer->birthday);
                $today = new DateTime();
                $age = $birthDate->diff($today)->y;
            }

            // Récupérer l'adresse principale pour ville et pays
            $id_address = (int)$this->context->cart->id_address_delivery;
            $address = new Address($id_address);
            $ville = pSQL($address->city);
            $postcode = pSQL($address->postcode); 
            $pays = pSQL($address->id_country);

            $id_order = (int)Tools::getValue('id_order');
            if ($id_order) {
                $order = new Order($id_order);
                $order_number = pSQL($order->reference);
                $montant = (float)$order->total_paid;
            } else {
                $order_number = 'N/A';
                $montant = 0.00;
            }


          $sql = "INSERT INTO sg_survey 
          (id_customer, name, id_answer, autre_answer, age, ville, pays, postcode, order_number, sexe, montant, date_add)
          VALUES (
            '".(int)$id_customer."',
            '".pSQL($name)."',
            '".(int)$id_answer."',
            ".($autre_answer_clean !== null ? "'".pSQL($autre_answer_clean)."'" : "NULL").",
            '".(int)$age."',
            '".pSQL($ville)."',
            '".pSQL($pays)."',
            '".pSQL($postcode)."',
            '".pSQL($order_number)."',
            '".pSQL($sexe)."',
            '".(float)$montant."',
            '".date('Y-m-d H:i:s')."'
          )";
      $result = Db::getInstance()->execute($sql);

      if (!$result) {
          die('Erreur d\'insertion : ' . Db::getInstance()->getMsgError());
      }
      die('Merci !');
        } else {
            if (isset($this->context->smarty->tpl_vars['order']->value)) {
                $order = $this->context->smarty->tpl_vars['order']->value;
            } else {
                $order = null;
            }
            $this->context->smarty->assign('order', $order);
            $this->context->smarty->assign('customer_firstname', $this->context->customer->firstname);
            $this->context->smarty->assign('survey_action', $this->context->link->getModuleLink('seagale', 'survey'));
            $this->setTemplate(_PS_THEME_DIR_ . 'templates/checkout/survey.tpl');
        }
    }
}
