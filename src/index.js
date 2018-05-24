import axios from 'axios';

const postAPI = axios.create({
  // 환경변수로 설정가능
  // 환경 변수는 빌드시 적용되므로 껐다 키자.
  baseURL: process.env.API_URL
});
const rootEl = document.querySelector('.root');
// async function index() {
  // await는 항상 비동기 함수 안에서만 쓸 수 있다
//   await
// }

// 로그인 설정 중복 제거
function login(token) {
  localStorage.setItem('token', token);
  // defaults
  // 설정 객체의 기본값으로 쓰인다.
  postAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
  rootEl.classList.add('root--authed');
}

function logout() {
  localStorage.removeItem('token');
  delete postAPI.defaults.headers['Authorization'];
  rootEl.classList.remove('root--authed');
}

// document.querySelector는 느린 메소드, 여러번 하기 않게 미리 캐시해두자
const templates = {
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postContent: document.querySelector('#post-content').content,
  login: document.querySelector('#login').content,
  postForm: document.querySelector('#post-form').content,
  comments: document.querySelector('#comments').content,
  commentItem: document.querySelector('#comment-item').content,
}

function render(fragment) {
  rootEl.textContent = '';
  rootEl.appendChild(fragment);
} 
async function indexPage() {
  
  // 로딩 추가
  rootEl.classList.add('root--loading');
  const res = await postAPI.get('/posts?_expand=user');
  rootEl.classList.remove('root--loading');
  const listFragment = document.importNode(templates.postList, true);  

  listFragment.querySelector('.post-list__login-btn').addEventListener('click', e => {
    loginPage();
  });
  listFragment.querySelector('.post-list__logout-btn').addEventListener('click', e => {
    logout();
    indexPage();
  });
  listFragment.querySelector('.post-list__new-post-btn').addEventListener('click', e => {
    postFormPage();
  });

  res.data.forEach(post => {
    const fragment = document.importNode(templates.postItem, true);
    fragment.querySelector('.post-item__author').textContent = post.user.username;
    const pEl = fragment.querySelector('.post-item__title');
    pEl.textContent = post.title;
    pEl.addEventListener('click', e => {
      postContentPage(post.id);
    });
    listFragment.querySelector('.post-list').appendChild(fragment);
  });
  render(listFragment);
  
  // 1. Promise, then()
  // axios.get('/posts').then(res => {
    //   
    // });
  }
  
async function postContentPage(postId) {
  const res = await postAPI.get(`/posts/${postId}`);
  const fragment = document.importNode(templates.postContent, true);
  fragment.querySelector(`.post-content__title`).textContent = res.data.title;
  fragment.querySelector(`.post-content__body`).textContent = res.data.body;

  // 뒤로가기
  fragment.querySelector(`.post-content__back-btn`).addEventListener('click', e => {
    indexPage();
  });

  // 로그아웃해도 글은 볼 수 있도록
  if (localStorage.getItem('token')) {
    const commentsFragment = document.importNode(templates.comments, true);
    const commentsRes = await postAPI.get(`/posts/${postId}/comments`);
    commentsRes.data.forEach(item => {
      const itemFragment = document.importNode(templates.commentItem, true);
      itemFragment.querySelector('.comment-item__body').textContent = item.body;
      commentsFragment.querySelector('.comment__list').appendChild(itemFragment);
    });
    const formEl = commentsFragment.querySelector('.comments_form');
    formEl.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {
        body: e.target.elements.body.value
      }
      const res = await postAPI.post(`/posts/${postId}/comments`, payload);
      postContentPage(postId);
    });
    fragment.appendChild(commentsFragment);
  }

  render(fragment);
}

async function loginPage() {
  const fragment = document.importNode(templates.login, true);
  const formEl = fragment.querySelector('.login__form');
                                  // ★★★
  formEl.addEventListener('submit', async e => {
    // 이렇게 가져오는 방법도 있음
    // const username = fragment.querySelector('.login__username').value;
    
    // e.target.elements.username === fragment.querySelector('[name=username]');
    const payload = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    }
    e.preventDefault();
    const res = await postAPI.post('/users/login', payload);
    login(res.data.token);
    indexPage();
  });
  render(fragment);
}

async function postFormPage() {
  const fragment = document.importNode(templates.postForm, true);
  fragment.querySelector('.post-form__back-btn').addEventListener('click', e => {
    e.preventDefault();
    indexPage();
  });
  const formEl = fragment.querySelector('.post-form');
  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      title: e.target.elements.title.value,
      body: e.target.elements.body.value
    }
    const res = await postAPI.post('/posts', payload);
    console.log(res);
    postContentPage(res.data.id);
  });
  render(fragment);
}

if (localStorage.getItem('token')) {
  login(localStorage.getItem('token'));
}
// loginPage();
indexPage();