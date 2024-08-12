const getTypeColor = type => {
   const normal = '#F5F5F5'
   return {
     normal,
     fire: '#FDDFDF',
     grass: '#DEFDE0',
     electric: '#FCF7DE',
     ice: '#DEF3FD',
     water: '#DEF3FD',
     ground: '#F4E7DA',
     rock: '#D5D5D4',
     fairy: '#FCEAFF',
     poison: '#98D7A5',
     bug: '#F8D5A3',
     ghost: '#CAC0F7',
     dragon: '#97B3E6',
     psychic: '#EAEDA1',
     fighting: '#E6E0D4'
   }[type] || normal
 };

const getAllFulfilled = async ({ arr, fuc }) =>{
   const promise = arr.map(fuc);
   const results = await Promise.allSettled(promise);
   return results.filter(res=> res.status === 'fulfilled');
};

const getPokeType = async pokeResult =>{
   const fullfilt = await getAllFulfilled({fuc:poke=> fetch(poke.url), arr: pokeResult });
   const pokePromise = fullfilt.map(res=> res.value.json());
   const pokemons = await Promise.all(pokePromise);   
   return pokemons.map(poke=> poke.types.map(info => info.type.name));
};

const getPokeImg = async (pokeResult)=>{
   const fullfilt =  await getAllFulfilled({arr: pokeResult, fuc:poke=> fetch(poke.url)});
   const pokePromise = fullfilt.map(res=> res.value.json());
   const pokemons = await Promise.all(pokePromise);
   return pokemons.map(spri=> spri.sprites.other.dream_world.front_default);
}

const getPokeIds = pokeResult=> pokeResult.map(({url}) =>{ 
   
   const urlIsArray = url.split('/');
   return urlIsArray.at(urlIsArray.length -2);
})

const limit = 15;
let offset = 0;

const getStatus = async (pokeResult)=>{
   const fullfilt = await getAllFulfilled({fuc:poke=> fetch(poke.url), arr: pokeResult })
   const pokePromise = fullfilt.map(res=> res.value.json());
   const pokemon = await Promise.all(pokePromise);
   return pokemon.map(poke=> poke.stats.map(base=> (base.base_stat)));
};

const getNameStatus = async (pokeResult)=>{
   const fullfilt = await getAllFulfilled({fuc:poke=> fetch(poke.url), arr: pokeResult })
   const pokePromise = fullfilt.map(res=> res.value.json());
   const pokemon = await Promise.all(pokePromise);
   return pokemon.map(poke=> poke.stats.map(base=> (base.stat.name)));
};

const getPokemons = async ()=> {
   try {
      const result = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
      if(!result.ok)throw new Error("Algo deu errado");

      const { results: pokeResult } = await result.json();
      const pokeType = await getPokeType(pokeResult);
      const ids = getPokeIds(pokeResult);
      const pokeImgs = await getPokeImg(pokeResult);
      const statusNumber = await getStatus(pokeResult);
      const statusName = await getNameStatus(pokeResult);
      
      const pokemons = ids.map((id, i)=> ({id, name: pokeResult[i].name, types: pokeType[i], imagUrl: pokeImgs[i],numberStatus : statusNumber[i] ,nameStatus :statusName[i]}))

      offset += limit;
            
      return pokemons
    
 } catch (error) {
    console.log(error);
    
 }
};

const addDataModal = ({ id, name, types, imagUrl, numberStatus, nameStatus })=>{
   const imgModal = document.querySelector('#imgModal');
   const modalTitle = document.querySelector('.modal-title');
   const liModal = document.querySelectorAll('[data-ul="status"] li');

   imgModal.setAttribute('src',imagUrl);
   modalTitle.textContent = `${id}. ${name[0].toUpperCase()}${name.slice(1)}`;
   liModal.forEach((li,i)=>{
      li.textContent = `${nameStatus[i]}: ${numberStatus[i]}`
   });
}

const renderPokemon = pokemons=>{
   const ul = document.querySelector('[data-ul="pokemons"]');
   const fraguimento = document.createDocumentFragment();

   pokemons.forEach(({ id, name, types, imagUrl, numberStatus, nameStatus }) => {
      const li = document.createElement('li');
      const divBorder = document.createElement('div');
      const img = document.createElement('img');
      const divbody = document.createElement('div');
      const h5 = document.createElement('h5');
      const p = document.createElement('p');
      const tamanho = '166px'
      const [firstype] = types;

      li.classList.add('col');


      divBorder.className = 'card  divBorder border-5';
      divBorder.style.setProperty('--type-color', getTypeColor(firstype));
      divBorder.setAttribute('data-bs-toggle', 'modal');
      divBorder.setAttribute('data-bs-target', '#staticBackdrop');


      img.setAttribute('src', imagUrl);
      img.setAttribute('alt', name);
      img.setAttribute('width', tamanho);
      img.setAttribute('height', tamanho);

      
      img.className = 'card-img-top p-2';
      divbody.className = 'card-body border-top border-light border-4';
      h5.className = 'card-title text-center';
      p.className = 'card-text text-center';

      h5.textContent= `${id}. ${name[0].toUpperCase()}${name.slice(1)}`;
      p.textContent = types.length > 1 ? types.join(' | ') : firstype;

      divbody.append(h5, p);
      divBorder.append(img, divbody);
      li.append(divBorder);

      divBorder.addEventListener('click',()=>{
         addDataModal({ id, name, types, imagUrl, numberStatus, nameStatus });
      });
      
      fraguimento.append(li);  
   });
   
   ul.append(fraguimento);

};

const observrPokemon = pokemonsObserver =>{
   const lastPokemon = document.querySelector('[data-ul="pokemons"]').lastChild;
   pokemonsObserver.observe(lastPokemon)
};

const handLeNextPokemonsRender = ()=>{
   const pokemonsObserver = new IntersectionObserver( async ([lastPokemon], observe)=>{
      if(!lastPokemon.isIntersecting) return    
         observe.unobserve(lastPokemon.target);

         const pokemons = await getPokemons();
         renderPokemon(pokemons);
         observrPokemon(pokemonsObserver);
   }, {rootMargin: '500px'});
   observrPokemon(pokemonsObserver)
};

const renderPageLoaded = async ()=>{
 const pokemons = await getPokemons()
 renderPokemon(pokemons);
 handLeNextPokemonsRender(); 
  
};

renderPageLoaded();