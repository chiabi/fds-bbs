import axios from 'axios';

// async function index() {
  // await는 항상 비동기 함수 안에서만 쓸 수 있다
//   await
// }

// document.querySelector는 느린 메소드, 여러번 하기 않게 미리 캐시해두자
const rootEl = document.querySelector('.root');
const templates = {
  postList: document.querySelector('#post-list').content,
  postItem: document.querySelector('#post-item').content
}

async function indexPage() {
  // 2. async, await
  // 원래 then()으로 기다리던 것을 await 뒤에 써주면 됨
  const res = await axios.get('http://localhost:3000/posts');
  const listFragment = document.importNode(templates.postList, true);  
  res.data.forEach(post => {
    // 동적으로 엘리먼트를 만들때
    // 모두 이런식으로 자바스크립트로 만들어주면 굉장히 불편함
    
    // 서버 측 자바스크립트로 전통적 웹 개발에서는 ejs를 사용했다.
    // 프론트 단에서는 template태그를 사용할 것이다.
    // const pEl = document.createElement('p');
    
    // 최신 웹브라우저에서 지원하는 template을 사용
    const fragment = document.importNode(templates.postItem, true);
    const pEl = fragment.querySelector('.post-item__title');
    pEl.textContent = post.title;
    listFragment.querySelector('.post-list').appendChild(fragment);
  });
  rootEl.appendChild(listFragment);

  // 1. Promise, then()
  // axios.get('http://localhost:3000/posts').then(res => {
  //   
  // });
}

indexPage();