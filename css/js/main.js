const urlBase = 'https://db.ygoprodeck.com/api/v7/cardinfo.php?'
let count = 0;

const selectLang = document.querySelector('#selectLang');
const selectArchetypes = document.getElementById('selectArchetypes');
const selectTypes = document.getElementById('selectTypes');
const selectRace = document.getElementById('selectRace');
const selectLevel = document.getElementById('selectLevel');
const selectLink = document.getElementById('selectLink');
const search = document.querySelector('#search');
const cardContainer = document.querySelector('.cardContainer');
const dataList = document.querySelector('#dataList');
const searchField = document.getElementById('searchField');
const numberResults = document.querySelector('#numberResults');
const modal = document.querySelector('.modal');
const closeModal = document.querySelector('#close');
const cardAmplied = document.querySelector('.cardAmplied');

(async () => {
  const resp = await fetch('./db/data.json');
  const dataFilters = await resp.json();

  dataFilters.map(el => el.archetypes.map(element => {
    let result = `<option value="archetype=${element}">${element}</option>`;
    selectArchetypes.innerHTML += result;
  }));

  dataFilters.map(el => el.type.map(element => {
    let result = `<option value="type=${element}">${element}</option>`;
    selectTypes.innerHTML += result;
  }));

  dataFilters.map(el => el.race.map(element => {
    let result = `<option value="race=${element}">${element}</option>`;
    selectRace.innerHTML += result;
  }));

  dataFilters.map(el => el.level.map(element => {
    let result = `<option value="level=${element}">${element}</option>`;
    selectLevel.innerHTML += result;
  }));

  dataFilters.map(el => el.link.map(element => {
    let result = `<option value="link=${element}">${element}</option>`;
    selectLink.innerHTML += result;
  }));

  const respId = await fetch('./db/ids.json');
  const dataId = await respId.json();


  function searchCardId(event) {

    const searched = event.target.value;
    const cardFound = searchCardFilter(searched, dataId);

    dataList.innerHTML = ``;

    if (searched.length > 2) {
      renderDataResult(cardFound);
    };
    renderDataList();
  };

  function renderDataResult(data) {
    return data.map((dados, index) => {
      if (index < 14) {
        let result = `<option>${dados.name} (${dados.id})</option>`;
        dataList.innerHTML += result;
      }
    });
  };

  function renderDataList() {
    if (searchField.value == '') {
      dataList.style.display = "none";
    } else {
      dataList.style.display = "block";
    };
  };

  fetch('https://db.ygoprodeck.com/api/v7/randomcard.php').then(resp => resp.json()).then(result => {
    result.card_images.map(el => {
      cardContainer.innerHTML += `
      <div class="render">
                  <p>${result.name}</p>
                  <img src="${el["image_url"]}" alt="">
                  <span><b>Description: </b>${result.desc}</span>
                  <button data-id="${result.id}">Ver mais</button>
      </div>`;
    });
  });

  searchField.addEventListener('keyup', _.debounce(searchCardId, 900));

})();

function searchCardFilter(searched, data) {
  return data.filter(dado => {
    return dado.name.toLowerCase().includes(searched);
  })
};

function renderCardAmplied(event) {
  event.preventDefault();

  const cardId = event.target.getAttribute('data-id');
  const valueLang = selectLang.options[selectLang.selectedIndex].value;
  let desc = 'Description';

  if (valueLang != '') {
    desc = 'Descrição';
  };

  if (cardId) {
    cardContainer.style.display = 'none';
    modal.style.display = 'flex';
    dataList.style.display = "none";
    fetch(`${urlBase}id=${cardId}&${valueLang}`).then(resp => resp.json()).then(result => {
      result.data.map(element => {
        element.card_images.map(el => {
          cardAmplied.innerHTML = `
             <div class="cardDetails">
                          <div class="imgWrapper">
                            <img src="${el["image_url"]}" alt="">
                          </div>
                          <div class="textDetails">
                            <p>${element.name}</p>
                            <span><b>Arquetipo: </b>${element.archetype}</span>
                            <span><b>Ataque: </b>${element.atk}</span>
                            <span><b>Defesa: </b>${element.def}</span>
                            <span><b>Atributo: </b>${element.attribute}</span>
                            <span><b>Level: </b>${element.level}</span>
                            <span><b>Race: </b>${element.race}</span>
                            <span><b>Type: </b>${element.type}</span>
                            <span><b>${desc}: </b>${element.desc}</span>
                            </div>
              </div>`;
        });
      });
    });
  };

  closeModal.addEventListener('click', () => {
    cardContainer.style.display = 'flex';
    modal.style.display = 'none';
    cardAmplied.innerHTML = '';
  });
};

function main() {

  const valueArch = selectArchetypes.options[selectArchetypes.selectedIndex].value;
  const valueType = selectTypes.options[selectTypes.selectedIndex].value;
  const valueRace = selectRace.options[selectRace.selectedIndex].value;
  const valueLevel = selectLevel.options[selectLevel.selectedIndex].value;
  const valueLink = selectLink.options[selectLink.selectedIndex].value;
  const valueLang = selectLang.options[selectLang.selectedIndex].value;

  if (searchField.value || valueArch || valueType || valueRace || valueLevel || valueLink || valueLang != '') {
    let ID = '';
    let desc = 'Description';

    if (searchField.value != '') {
      ID = `id=${searchField.value.replace(/\D/g, '')}`;
    }

    if (valueLang != '') {
      desc = 'Descrição';
    };

    fetch(`${urlBase}${valueType}&${valueRace}&${valueArch}&${valueLevel}&${valueLink}&${ID}&${valueLang}`)
      .then(response => response.json())

      .then(result => {

        const dataResult = result.data;
        function searchCard(event) {
          const searched = event.target.value;

          const cardFound = searchCardFilter(searched, dataResult);
          if (cardFound.length > 0) {
            Render(cardFound);
          } else {
            cardContainer.innerHTML = '<span>Nenhum card encontrado</span>';
            numberResults.innerHTML = '';
          };
        };

        function Render(data) {
          let render = '';
          data.map((element) => {
            element.card_images.map(el => {

              render += `
                      <div class="render">
                                  <p>${element.name}</p>
                                  <img src="${el["image_url"]}" alt="">
                                  <span><b>${desc}: </b>${element.desc}</span>
                                  <button data-id="${element.id}">Ver mais</button>
                      </div>`;

              cardContainer.innerHTML = render;
              count++;
              numberResults.innerHTML = `${count} resultados encontrados`;
            });
          });
          count = 0;
        };

        searchField.addEventListener('keyup', _.debounce(searchCard, 100));

        Render(dataResult);

      }).catch(() => {
        cardContainer.innerHTML = '<span>Ocorreu um erro, por favor, selecione apenas um campo de pesquisa e deixe os outros com o valor padrão.</span>';
        numberResults.innerHTML = `${count} resultados encontrados`;
      });
  };
};

search.addEventListener("click", main);
document.body.addEventListener('click', renderCardAmplied);

document.querySelector('h1').onclick = () => location.reload();



