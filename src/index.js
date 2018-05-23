import axios from 'axios';

const postAPI = axios.create({
  baseURL: process.env.API_URL
});
const rootEl = document.querySelector('.root');

// 로그인 설정 중복 제거
function login(token, id) {
  localStorage.setItem('token', token);
  localStorage.setItem('userId', id);

  postAPI.defaults.headers['Authorization'] = `Bearer ${token}`;
  rootEl.classList.add('root--authed');
}

// 로그아웃
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');

  delete postAPI.defaults.headers['Authorization'];
  rootEl.classList.remove('root--authed');
}

// 탬플릿 캐싱
const templates = {
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content,
  postContent: document.querySelector('#post-content').content,
  login: document.querySelector('#login').content,
  postForm: document.querySelector('#post-form').content,
  postModifyForm: document.querySelector('#post-modify-form').content,
}

// root에 렌더
function render(fragment) {
  rootEl.textContent = '';
  rootEl.appendChild(fragment);
} 

// 게시글 목록 페이지
async function indexPage() {
  const res = await postAPI.get('/posts');
  const listFragment = document.importNode(templates.postList, true);  

  // 로그인 버튼 클릭시
  listFragment.querySelector('.post-list__login-btn').addEventListener('click', e => {
    loginPage();
  });

  // 로그아웃 버튼 클릭시
  listFragment.querySelector('.post-list__logout-btn').addEventListener('click', e => {
    logout();
    indexPage();
  });

  // 새글 작성하기 버튼 클릭시
  listFragment.querySelector('.post-list__new-post-btn').addEventListener('click', e => {
    postFormPage();
  });

  // 게시글 뿌리기
  res.data.forEach(post => {
    const fragment = document.importNode(templates.postItem, true);
    const pEl = fragment.querySelector('.post-item__title');
    pEl.textContent = post.title;
    pEl.addEventListener('click', e => {
      postContentPage(post.id);
    });
    listFragment.querySelector('.post-list').appendChild(fragment);
  });
  render(listFragment);
}

// 게시글 페이지
async function postContentPage(postId) {
  const res = await postAPI.get(`/posts/${postId}`);
  const fragment = document.importNode(templates.postContent, true);
  fragment.querySelector('.post-content__title').textContent = res.data.title;
  fragment.querySelector('.post-content__body').textContent = res.data.body;

  // 뒤로가기
  fragment.querySelector('.post-content__back-btn').addEventListener('click', e => {
    indexPage();
  });

  // 작성자에게만 수정하기, 삭제하기 버튼을 보여줌 
  if (res.data.userId === parseInt(localStorage.getItem('userId'))) {
    fragment.querySelector('.post-content').classList.add('post-content--author');
    fragment.querySelector('.post-content__modify-btn').addEventListener('click', e => {
      e.preventDefault();
      postModifyFormPage(postId);
    });
    fragment.querySelector('.post-content__delete-btn').addEventListener('click', async e => {
      e.preventDefault();
      await postAPI.delete(`/posts/${postId}`);
      indexPage();
    });
  }
  render(fragment);
}

// 로그인 페이지
async function loginPage() {
  const fragment = document.importNode(templates.login, true);
  const formEl = fragment.querySelector('.login__form');
                                  // ★★★
  formEl.addEventListener('submit', async e => {
    const payload = {
      username: e.target.elements.username.value,
      password: e.target.elements.password.value
    }
    e.preventDefault();
    const res = await postAPI.post('/users/login', payload);
    const res_users = await postAPI.get('/users');
    login(res.data.token, res_users.data.filter(item => item.username === payload.username)[0]['id']);
    indexPage();
  });
  render(fragment);
}

// 새 글 작성하기 페이지
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
    postContentPage(res.data.id);
  });
  render(fragment);
}

// 수정하기 페이지
async function postModifyFormPage(postId) {
  const res = await postAPI.get(`/posts/${postId}`);
  const fragment = document.importNode(templates.postModifyForm, true);
  fragment.querySelector('.post-modify-form__cancel').addEventListener('click', e => {
    e.preventDefault();
    indexPage();
  });
  const formEl = fragment.querySelector('.post-modify-form');
  formEl.elements.title.value = res.data.title;
  formEl.elements.body.value = res.data.body;
  formEl.addEventListener('submit', async e => {
    e.preventDefault();
    const payload = {
      title: e.target.elements.title.value,
      body: e.target.elements.body.value
    }
    const res = await postAPI.patch(`/posts/${postId}`, payload);
    postContentPage(res.data.id);
  });
  render(fragment);
}

// 초기 실행 함수 
if (localStorage.getItem('token')) {
  login(localStorage.getItem('token'), localStorage.getItem('userId'));
}
indexPage();