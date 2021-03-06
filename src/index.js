import {Api} from './js/Api.js';
import {Card} from './js/Card.js';
import {CardList} from './js/CardList.js';
import {FormValidator} from './js/FormValidator.js';
import {Popup} from './js/Popup.js';
import {UserInfo} from './js/UserInfo.js';
import './pages/index.css';

(function () {
  const placesList = document.querySelector('.places-list');
  const template = document.querySelector('.template').content.querySelector('.place-card');
  const addButton = document.querySelector('.user-info__button');
  const editButton = document.querySelector('.user-info__edit-button')
  const addPopup = document.querySelector('.popup__add-popup')
  const editPopup = document.querySelector('.popup__edit-popup');
  const imagePopup = document.querySelector('.popup__image-popup');
  const openedImage = document.querySelector('.popup__image');
  const addForm = document.querySelector('.popup__add-form');
  const editForm = document.querySelector('.popup__edit-form');
  const userAvatar = document.querySelector('.user-info__photo')
  const userName = document.querySelector('.user-info__name');
  const userAbout = document.querySelector('.user-info__about');
  const formTitle = document.querySelector('.popup__input_type_title');
  const formLink = document.querySelector('.popup__input_type_link-url');
  const formName = document.querySelector('.popup__input_type_name');
  const formAbout = document.querySelector('.popup__input_type_about');
  const errorMessages = {
    empty: 'Это обязательное поле',
    wrongLength: 'Должно быть от 2 до 30 символов',
    wrongUrl: 'Здесь должна быть ссылка',
  };
  const serverUrl = NODE_ENV === 'development' ? 'http://praktikum.tk' : 'https://praktikum.tk';
  const options = {
    url: `${serverUrl}/cohort11`,
    headers: {
      authorization: 'fdddf0c7-ae72-4c3f-aa2e-a7c22604dc0a',
      'Content-Type': 'application/json'
    }
  }

  function openImagePopup(imageUrl) {
    openedImage.src = imageUrl;
    popupImage.toggle();
  }

  function createCardCallback(item) {
    const card = new Card(item, template, openImagePopup);
    return card.create()
  }

  const cardList = new CardList(placesList, createCardCallback);
  const popupAdd = new Popup(addPopup);
  const popupEdit = new Popup(editPopup);
  const popupImage = new Popup(imagePopup);
  const userInfo = new UserInfo(userAvatar, userName, userAbout);
  const addFormValidation = new FormValidator(addForm, errorMessages);
  const editFormValidation = new FormValidator(editForm, errorMessages);
  const api = new Api(options);

  api.getUserInfo().then(res => {
    userInfo.setUserInfo(res.avatar, res.name, res.about);
    userInfo.updateUserInfo();
  }).catch(err => {
    console.log(err);
  });


  api.getInitialCards().then(res => {
    cardList.render(res);
  }).catch(err => {
    console.log(err);
  });

  addButton.addEventListener('click', () => {
    popupAdd.toggle();
    addFormValidation.clearError();
    addForm.reset();
  });

  editButton.addEventListener('click', () => {
    popupEdit.toggle();
    editFormValidation.clearError();
    editForm.reset();
    const getUserInfo = userInfo.getUserInfo();
    formName.value = getUserInfo.name;
    formAbout.value = getUserInfo.about;
  });

  addForm.addEventListener('input', addFormValidation.setEventListeners(), true);

  addForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const item = {
      name: formTitle.value,
      link: formLink.value
    };
    cardList.addCard(item);
    addForm.reset();
    popupAdd.toggle();
  });

  editForm.addEventListener('input', editFormValidation.setEventListeners(), true);

  editForm.addEventListener('submit', (event) => {
    event.preventDefault();
    api.patchUserInfo(formName.value, formAbout.value).then(res => {
      userInfo.setUserInfo(res.avatar, res.name, res.about);
      api.getUserInfo().then(res => {
        userInfo.setUserInfo(res.avatar, res.name, res.about);
        userInfo.updateUserInfo();
        popupEdit.toggle();
      })
      .catch(err => {
        console.log(err);
      });
    })
    .catch(err => {
      console.log(err);
    });
  });

})();
