import React, { Component } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import ToggleButton from 'react-toggle-button'
import './App.css';

class App extends Component {
  // TODO: Make default value of currentQuery more programmatic
  constructor(props) {
    super(props);

    let toggled = {};
    for (let i = 1; i < this.getLastPokemonNumber(); i++) {
      toggled[i] = (Queries.Full.query.includes(i.toString()) ? true : false);
    }

    this.state = {
      copied: false,
      evolving: true,
      includeBabies: true,
      selectedPreCreatedQueryCheckbox: 'Compact',
      checkboxesEnabled: true,
      language: 'English',
      toggled,
    };
  }

  getLastPokemonNumber() {
    const lastFamily = PokemonFamilies[PokemonFamilies.length - 1];
    return parseInt(lastFamily[lastFamily.length - 1].number);
  }

  getEvolutionListOfPokemon(evolutionNumber) {
    let evolutionList = [];
    PokemonFamilies.forEach((pokemonFamily) => {
      pokemonFamily.forEach((individualPokemon) => {
        if (individualPokemon.evolution === evolutionNumber) evolutionList.push(individualPokemon.number);
      })
    })

    return evolutionList;
  }

  // TODO: Generalize the concept of queries which include ranges beyond just 'Compact'
  getCurrentQuery = () => {
    let currentQuery = "";

    // If the user isn't evolving, don't include the translated 'evolve' value in the query
    const translatedEvolve = !this.state.evolving ? '' : `${ EvolveTranslations[this.state.language] }&`;

    // Explicitly set query; needed for 'Compact' which includes ranges (e.g. '110-125')
    if (this.state.selectedPreCreatedQueryCheckbox === 'Compact') {
      currentQuery = `${ translatedEvolve }${ Queries['Compact']['query'] }`;
    } else {
      let selectedNumbers = [];
      for (let i in Object.keys(this.state.toggled)) {
        if (this.state.toggled[i]) {
          selectedNumbers.push(i);
        }
      };
      currentQuery = `${ translatedEvolve }${ selectedNumbers.join(',') }`;
    }

    return currentQuery;
  }

  handlePreCreatedQueryCheckboxClick = (query) => {
    if (query === 'Compact') {
      this.setState({ selectedPreCreatedQueryCheckbox: query, checkboxesEnabled: false })
    } else {
      let toggled = {};
      for (let i in Object.keys(this.state.toggled)) {
        toggled[i] = (Queries[query]['query'].includes(i)) ? true : false;
      };
      this.setState({ toggled, selectedPreCreatedQueryCheckbox: query, checkboxesEnabled: true });
    }
  }

  handleIndividualCheckboxClick = (pokemonNumber) => {
    this.setState((prevState) => {
      let toggled = Object.assign({}, prevState.toggled);
      toggled[pokemonNumber] = !toggled[pokemonNumber]
      return { toggled, selectedPreCreatedQueryCheckbox: null };
    })
  }

  handleLanguageSelection = (e) => this.setState({ language: e.target.value});

  onSelectDeselectAllClick = (evolutionNumber, bool) => {
    const evolutionList = this.getEvolutionListOfPokemon(evolutionNumber);

    this.setState((prevState) => {
      let toggled = {};
      for (let i in Object.keys(prevState.toggled)) {
        toggled[i] = (evolutionList.includes(i) ? bool : prevState.toggled[i]);
      };

      return { toggled, selectedPreCreatedQueryCheckbox: null, checkboxesEnabled: true };
    })
  }

  renderEvolvingSelectionButton = () => (
    <div className="ToggleContainer EvolveButtonContainer">
      <label htmlFor="evolvingButton">Evolving?</label>
      <ToggleButton
        inactiveLabel='No'
        activeLabel='Yes'
        value={this.state.evolving}
        id="evolvingButton"
        onToggle={(value) => {
          this.setState({ evolving: !value }, this.updateCurrentQuery);
        }}
      />
    </div>
  )

  renderIncludeBabiesSelectionButton = () => (
    <div className="ToggleContainer IncludeBabiesButtonContainer">
      <label htmlFor="includeBabiesButton">Include Babies?</label>
      <ToggleButton
        inactiveLabel='No'
        activeLabel='Yes'
        value={this.state.includeBabies}
        id="includeBabiesButton"
        onToggle={(value) => {
          this.setState({ includeBabies: !value }, this.updateCurrentQuery);
        }}
      />
    </div>
  )

  renderLanguageSelection = () => {
    const options = Object.keys(EvolveTranslations).map((language) => {
      return (
        <option key={language} value={language}>{language}</option>
      )}
    )

    return (
      // TODO: Better classnames for ToggleContainer/LanguageSelect
      <div className="ToggleContainer LanguageSelect">
        <label className="LanguageSelectLabel" htmlFor="languageSelect">Language:</label>
        <select
          className="LanguageSelectSelect"
          id="languageSelect"
          onChange={this.handleLanguageSelection}
        >
          {options}
        </select>
      </div>
    )
  }

  renderSelectDeselectAllButtons = () => (
    <div className="SelectionButtons">
      <div className="SelectionLabelBlurb">
        * Higher evolutions can be used to find just-evolved Pokemon to transfer post-evolution
      </div>
      <div>
        <span className="SelectionLabel">First Evolutions:</span>
        <button id="selectAllFirstEvo" data-select-button onClick={this.onSelectDeselectAllClick.bind(this, 1, true)}>
          Select All
        </button>
        <button id="deselectAllSecondEvo" data-select-button onClick={this.onSelectDeselectAllClick.bind(this, 1, false)}>
          De-select All
        </button>
      </div>
      <div>
        <span className="SelectionLabel">Second Evolutions:</span>
        <button id="selectAllSecondEvo" data-select-button onClick={this.onSelectDeselectAllClick.bind(this, 2, true)}>
          Select All
        </button>
        <button id="deselectAllSecondEvo" data-select-button onClick={this.onSelectDeselectAllClick.bind(this, 2, false)}>
          De-select All
        </button>
      </div>
      <div>
        <span className="SelectionLabel">Third Evolutions:</span>
        <button id="selectAllThirdEvo" data-select-button onClick={this.onSelectDeselectAllClick.bind(this, 3, true)}>
          Select All
        </button>
        <button id="deselectAllThirdEvo" data-select-button onClick={this.onSelectDeselectAllClick.bind(this, 3, false)}>
          De-select All
        </button>
      </div>
    </div>
  )

  renderPrecreatedQueryCheckboxes = () => {
    return Object.keys(Queries).map((queryName) => {
      return (
        <li key={queryName}>
          <input
            type='checkbox'
            className="SelectionCheckbox SelectionCheckbox-preCreated"
            id={queryName}
            value={queryName}
            checked={this.state.selectedPreCreatedQueryCheckbox === queryName}
            onChange={this.handlePreCreatedQueryCheckboxClick.bind(this, queryName)}
          />
          <label htmlFor={queryName}>{Queries[queryName]['label']}</label>
        </li>
      )
    })
  }

  renderIndividualPokemonCheckboxes = () => {
    const metaTagsToSkip = ['nohigher', 'legend', 'special'];

    return PokemonFamilies.map((pf) => {
      // We deep-clone the array of objects
      const pokemonFamily = pf.map(a => ({...a}));

      this.filterBabyPokemon(pokemonFamily);

      return pokemonFamily.map((individualPokemon) => {
        // We skip rendering that pokemon's checkbox if their metadata is on our skiplist
        if (metaTagsToSkip.includes(individualPokemon.meta)) return null;

        return (
          <li key={individualPokemon.number}>
            <input
              type='checkbox'
              className={"SelectionCheckbox SelectionCheckbox-pokemon SelectionCheckbox-" + individualPokemon.evolution}
              id={individualPokemon.name}
              value={individualPokemon.number}
              checked={this.state.toggled[individualPokemon.number]}
              onChange={this.handleIndividualCheckboxClick.bind(this, individualPokemon.number)}
              enabled={this.state.checkboxesEnabled}
            />
            <label htmlFor={individualPokemon.name}>{individualPokemon.name}</label>
          </li>
        )
      })
    })
  }

  // If we're not including babies, we see if the current family has any babies present.
  // If so, we remove them and decrement the evol # of the remaining pokemon.
  filterBabyPokemon = (pokemonFamily) => {
    if (!this.state.includeBabies) {
      const babyPokemon = pokemonFamily.filter((individualPokemon) => individualPokemon.meta === 'baby')
      if (babyPokemon.length > 0) {
        pokemonFamily.splice(pokemonFamily.indexOf(babyPokemon[0]), 1)
        pokemonFamily.forEach((individualPokemon) => individualPokemon.evolution--)
      }
    }
  }

  render() {
    const currentQuery = this.getCurrentQuery();

    return (
      <div className="App">
        <div className="App-header">
          <h1>Pokemon Query Generator</h1>
        </div>
        <div className="Main-body">
          <h4>Inspired by <a href="https://www.reddit.com/r/TheSilphRoad/comments/6ztyu5/the_ultimate_mass_evolution_search_query/">this</a> Reddit thread.</h4>
          <div className="CurrentQuery">
            {currentQuery}
          </div>
          <CopyToClipboard
            text={currentQuery}
            onCopy={() => this.setState({copied: true})}
          >
            <button>Click to Copy</button>
          </CopyToClipboard>
          <div className="PokemonSelection">
            <ul className="QueryList">
              {this.renderEvolvingSelectionButton()}
              {this.renderIncludeBabiesSelectionButton()}
              {this.renderLanguageSelection()}
              {this.renderPrecreatedQueryCheckboxes()}
              <hr/>
              {this.renderSelectDeselectAllButtons()}
              {this.renderIndividualPokemonCheckboxes()}
            </ul>
          </div>
          <hr/>
          <div className="Footer">
            For comments or suggestion, message me <a href="https://www.reddit.com/user/mikeappell/">on Reddit.</a>
            <br/>
            <br/>
            Pokémon And All Respective Names are Trademark & © of Nintendo 1996-2018
            Pokémon GO is Trademark & © of Niantic, Inc.
            <br/>
            This website is not affiliated with Niantic Inc., The Pokemon Company or Nintendo, though I think they're peachy keen.
            <br/>
            <br/>
            Built using <a href="https://github.com/facebookincubator/create-react-app">Create React App</a>. Code can be found <a href="https://github.com/mikeappell/pokemon_evolve_query_react">here</a>.
          </div>
        </div>
      </div>
    );
  }
}

export default App;

export const Queries = {
  Compact: { label: "Compact Full Query (doesn't allow modification)", query: '1,4,7,10,13,16,19-23,27,29,32,37,41,43,46-60,63,66,69,72,74,77-92,95-116,118-147,152,155,158,161-179,183,187,191-246,353,355' },
  Full: { label: 'Full Query', query: ['1','4','7','10','13','16','19','21','23','27','29','32','37','41','43','46','48','50','52','54','56','58','60','63','66','69','72','74','77','79','81','84','86','88','90','92','96','98','100','102','104','109','111','113','116','118','120','133','138','140','147','152','155','158','161','163','165','167','170','172','173','174','175','177','179','183','187','194','204','209','216','218','220','223','228','231','238','239','240','246','353','355'] },
  Minimal: { label: 'Minimal Query', query: ['10','13','16','19','21','161','163','165','167','177'] },
  Water: { label: 'Water-Specific Query', query: ['10','13','16','19','21','60','72','86','90','116','161','163','165','167','177','183','194','223'] },
  Forest: { label: 'Forest-Specfic Query', query: ['10','13','16','19','21','29','32','43','69','161','163','165','167','177','191','204'] },
};

export const EvolveTranslations = {
  English: 'evolve',
  Spanish: 'evolucionar',
  German: 'entwickeln',
  Italian: 'evolvere',
  French: 'évoluer',
  Dutch: 'evolueren',
  Greek: 'αναπτύσσω',
  Portuguese: 'evoluir',
  Japanese: '進化する',
  Korean: '진화하다',
}

// Legend for metadata:
// * 'needevo' - Requires an evolution item
// * 'isevo' - Product of an evolution item
// * 'baby' - Baby pokemon
// * 'nohigher' - No higher evolutions available (currently)
// * 'legend' - Legendary pokemon
// * 'special' - Special for some other reason

export const PokemonFamilies = [
  [
    { name: 'Bulbasaur', number: '1', evolution: 1 },
    { name: 'Ivysaur', number: '2', evolution: 2 },
    { name: 'Venusaur', number: '3', evolution: 3 },
  ],
  [
    { name: 'Charmander', number: '4', evolution: 1 },
    { name: 'Charmeleon', number: '5', evolution: 2 },
    { name: 'Charizard', number: '6', evolution: 3 },
  ],
  [
    { name: 'Squirtle', number: '7', evolution: 1 },
    { name: 'Wartortle', number: '8', evolution: 2 },
    { name: 'Blastoise', number: '9', evolution: 3 },
  ],
  [
    { name: 'Caterpie', number: '10', evolution: 1 },
    { name: 'Metapod', number: '11', evolution: 2 },
    { name: 'Butterfree', number: '12', evolution: 3 },
  ],
  [
    { name: 'Weedle', number: '13', evolution: 1 },
    { name: 'Kakuna', number: '14', evolution: 2 },
    { name: 'Beedrill', number: '15', evolution: 3 },
  ],
  [
    { name: 'Pidgey', number: '16', evolution: 1 },
    { name: 'Pidgeotto', number: '17', evolution: 2 },
    { name: 'Pidgeot', number: '18', evolution: 3 },
  ],
  [
    { name: 'Rattata', number: '19', evolution: 1 },
    { name: 'Raticate', number: '20', evolution: 2 },
  ],
  [
    { name: 'Spearow', number: '21', evolution: 1 },
    { name: 'Fearow', number: '22', evolution: 2 },
  ],
  [
    { name: 'Ekans', number: '23', evolution: 1 },
    { name: 'Arbok', number: '24', evolution: 2 },
  ],
  [
    { name: 'Pichu', number: '172', evolution: 1, meta: 'baby' },
    { name: 'Pikachu', number: '25', evolution: 2 },
    { name: 'Raichu', number: '26', evolution: 3 },
  ],
  [
    { name: 'Sandshrew', number: '27', evolution: 1 },
    { name: 'Sandslash', number: '28', evolution: 2 },
  ],
  [
    { name: 'Nidoran♀',  number: '29', evolution: 1 },
    { name: 'Nidorina', number: '30', evolution: 2 },
    { name: 'Nidoqueen', number: '31', evolution: 3 },
  ],
  [
    { name: 'Nidoran♂',  number: '32', evolution: 1 },
    { name: 'Nidorino', number: '33', evolution: 2 },
    { name: 'Nidoking', number: '34', evolution: 3 },
  ],
  [
    { name: 'Cleffa', number: '173', evolution: 1, meta: 'baby' },
    { name: 'Clefairy', number: '35', evolution: 2 },
    { name: 'Clefable', number: '36', evolution: 3 },
  ],
  [
    { name: 'Vulpix', number: '37', evolution: 1 },
    { name: 'Ninetales', number: '38', evolution: 2 },
  ],
  [
    { name: 'Igglybuff', number: '174', evolution: 1, meta: 'baby' },
    { name: 'Jigglypuff', number: '39', evolution: 2 },
    { name: 'Wigglytuff', number: '40', evolution: 3 },
  ],
  [
    { name: 'Zubat', number: '41', evolution: 1 },
    { name: 'Golbat', number: '42', evolution: 2 },
    { name: 'Crobat', number: '169', evolution: 3 },
  ],
  [
    { name: 'Oddish', number: '43', evolution: 1 },
    { name: 'Gloom', number: '44', evolution: 2 },
    { name: 'Vileplume', number: '45', evolution: 3 },
  ],
  [
    { name: 'Paras', number: '46', evolution: 1 },
    { name: 'Parasect', number: '47', evolution: 2 },
  ],
  [
    { name: 'Venonat', number: '48', evolution: 1 },
    { name: 'Venomoth', number: '49', evolution: 2 },
  ],
  [
    { name: 'Diglett', number: '50', evolution: 1 },
    { name: 'Dugtrio', number: '51', evolution: 2 },
  ],
  [
    { name: 'Meowth', number: '52', evolution: 1 },
    { name: 'Persian', number: '53', evolution: 2 },
  ],
  [
    { name: 'Psyduck', number: '54', evolution: 1 },
    { name: 'Golduck', number: '55', evolution: 2 },
  ],
  [
    { name: 'Mankey', number: '56', evolution: 1 },
    { name: 'Primeape', number: '57', evolution: 2 },
  ],
  [
    { name: 'Growlithe', number: '58', evolution: 1 },
    { name: 'Arcanine', number: '59', evolution: 2 },
  ],
  [
    { name: 'Poliwag', number: '60', evolution: 1 },
    { name: 'Poliwhirl', number: '61', evolution: 2 },
    { name: 'Poliwrath', number: '62', evolution: 3 },
    { name: 'Politoed', number: '186', evolution: 3, meta: 'isevo' },
  ],
  [
    { name: 'Abra', number: '63', evolution: 1 },
    { name: 'Kadabra', number: '64', evolution: 2 },
    { name: 'Alakazam', number: '65', evolution: 3 },
  ],
  [
    { name: 'Machop', number: '66', evolution: 1 },
    { name: 'Machoke', number: '67', evolution: 2 },
    { name: 'Machamp', number: '68', evolution: 3 },
  ],
  [
    { name: 'Bellsprout', number: '69', evolution: 1 },
    { name: 'Weepinbell', number: '70', evolution: 2 },
    { name: 'Victreebel', number: '71', evolution: 3 },
    { name: 'Bellossom', number: '182', evolution: 3, meta: 'isevo' },
  ],
  [
    { name: 'Tentacool', number: '72', evolution: 1 },
    { name: 'Tentacruel', number: '73', evolution: 2 },
  ],
  [
    { name: 'Geodude', number: '74', evolution: 1 },
    { name: 'Graveler', number: '75', evolution: 2 },
    { name: 'Golem', number: '76', evolution: 3 },
  ],
  [
    { name: 'Ponyta', number: '77', evolution: 1 },
    { name: 'Rapidash', number: '78', evolution: 2 },
  ],
  [
    { name: 'Slowpoke', number: '79', evolution: 1 },
    { name: 'Slowbro', number: '80', evolution: 2 },
    { name: 'Slowking', number: '199', evolution: 2, meta: 'isevo' },
  ],
  [
    { name: 'Magnemite', number: '81', evolution: 1 },
    { name: 'Magneton', number: '82', evolution: 2 },
  ],
  [
    { name: "Farfetch'd", number: '83', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Doduo', number: '84', evolution: 1 },
    { name: 'Dodrio', number: '85', evolution: 2 },
  ],
  [
    { name: 'Seel', number: '86', evolution: 1 },
    { name: 'Dewgong', number: '87', evolution: 2 },
  ],
  [
    { name: 'Grimer', number: '88', evolution: 1 },
    { name: 'Muk', number: '89', evolution: 2 },
  ],
  [
    { name: 'Shellder', number: '90', evolution: 1 },
    { name: 'Cloyster', number: '91', evolution: 2 },
  ],
  [
    { name: 'Gastly', number: '92', evolution: 1 },
    { name: 'Haunter', number: '93', evolution: 2 },
    { name: 'Gengar', number: '94', evolution: 3 },
  ],
  [
    { name: 'Onix', number: '95', evolution: 1, meta: 'needevo' },
    { name: 'Steelix', number: '208', evolution: 2, meta: 'isevo' },
  ],
  [
    { name: 'Drowzee', number: '96', evolution: 1 },
    { name: 'Hypno', number: '97', evolution: 2 },
  ],
  [
    { name: 'Krabby', number: '98', evolution: 1 },
    { name: 'Kingler', number: '99', evolution: 2 },
  ],
  [
    { name: 'Voltorb', number: '100', evolution: 1 },
    { name: 'Electrode', number: '101', evolution: 2 },
  ],
  [
    { name: 'Exeggcute', number: '102', evolution: 1 },
    { name: 'Exeggutor', number: '103', evolution: 2 },
  ],
  [
    { name: 'Cubone', number: '104', evolution: 1 },
    { name: 'Marowak', number: '105', evolution: 2 },
  ],
  [
    { name: 'Tyrogue', number: '236', evolution: 1, meta: 'special' },
    { name: 'Hitmonlee', number: '106', evolution: 2, meta: 'special' },
    { name: 'Hitmonchan', number: '107', evolution: 2, meta: 'special' },
    { name: 'Hitmontop', number: '237', evolution: 2, meta: 'special' },
  ],
  [
    { name: 'Lickitung', number: '108', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Koffing', number: '109', evolution: 1 },
    { name: 'Weezing', number: '110', evolution: 2 },
  ],
  [
    { name: 'Rhyhorn', number: '111', evolution: 1 },
    { name: 'Rhydon', number: '112', evolution: 2 },
  ],
  [
    { name: 'Chansey', number: '113', evolution: 1 },
    { name: 'Blissey', number: '242', evolution: 2 },
  ],
  [
    { name: 'Tangela', number: '114', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Kangaskhan', number: '115', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Horsea', number: '116', evolution: 1 },
    { name: 'Seadra', number: '117', evolution: 2, meta: 'needevo' },
    { name: 'Kingdra', number: '230', evolution: 3, meta: 'isevo' },
  ],
  [
    { name: 'Goldeen', number: '118', evolution: 1 },
    { name: 'Seaking', number: '119', evolution: 2 },
  ],
  [
    { name: 'Staryu', number: '120', evolution: 1 },
    { name: 'Starmie', number: '121', evolution: 2 },
  ],
  [
    { name: 'Mr Mime', number: '122', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Scyther', number: '123', evolution: 1, meta: 'needevo' },
    { name: 'Scizor', number: '212', evolution: 2, meta: 'isevo' },
  ],
  [
    { name: 'Smoochum', number: '238', evolution: 1, meta: 'baby' },
    { name: 'Jynx', number: '124', evolution: 2 },
  ],
  [
    { name: 'Elekid', number: '239', evolution: 1, meta: 'baby' },
    { name: 'Electabuzz', number: '125', evolution: 2 },
  ],
  [
    { name: 'Magby', number: '240', evolution: 1, meta: 'baby' },
    { name: 'Magmar', number: '126', evolution: 2 },
  ],
  [
    { name: 'Pinsir', number: '127', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Tauros', number: '128', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Magikarp', number: '129', evolution: 1, meta: 'special' },
    { name: 'Gyarados', number: '130', evolution: 2, meta: 'special' },
  ],
  [
    { name: 'Lapras', number: '131', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Ditto', number: '132', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Eevee', number: '133', evolution: 1, meta: 'special' },
    { name: 'Vaporeon', number: '134', evolution: 2, meta: 'special' },
    { name: 'Jolteon', number: '135', evolution: 2, meta: 'special' },
    { name: 'Flareon', number: '136', evolution: 2, meta: 'special' },
    { name: 'Espeon', number: '196', evolution: 2, meta: 'special' },
    { name: 'Umbreon', number: '197', evolution: 2, meta: 'special' },
  ],
  [
    { name: 'Porygon', number: '137', evolution: 1, meta: 'needevo' },
    { name: 'Porygon2', number: '233', evolution: 2, meta: 'isevo' },
  ],
  [
    { name: 'Omanyte', number: '138', evolution: 1 },
    { name: 'Omastar', number: '139', evolution: 2 },
  ],
  [
    { name: 'Kabuto', number: '140', evolution: 1 },
    { name: 'Kabutops', number: '141', evolution: 2 },
  ],
  [
    { name: 'Aerodactyl', number: '142', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Snorlax', number: '143', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Articuno', number: '144', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Zapdos', number: '145', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Moltres', number: '146', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Dratini', number: '147', evolution: 1 },
    { name: 'Dragonair', number: '148', evolution: 2 },
    { name: 'Dragonite', number: '149', evolution: 3 },
  ],
  [
    { name: 'Mewtwo', number: '150', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Mew', number: '151', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Chikorita', number: '152', evolution: 1 },
    { name: 'Bayleef', number: '153', evolution: 2 },
    { name: 'Meganium', number: '154', evolution: 3 },
  ],
  [
    { name: 'Cyndaquil', number: '155', evolution: 1 },
    { name: 'Quilava', number: '156', evolution: 2 },
    { name: 'Typhlosion', number: '157', evolution: 3 },
  ],
  [
    { name: 'Totodile', number: '158', evolution: 1 },
    { name: 'Croconaw', number: '159', evolution: 2 },
    { name: 'Feraligatr', number: '160', evolution: 3 },
  ],
  [
    { name: 'Sentret', number: '161', evolution: 1 },
    { name: 'Furret', number: '162', evolution: 2 },
  ],
  [
    { name: 'Hoothoot', number: '163', evolution: 1 },
    { name: 'Noctowl', number: '164', evolution: 2 },
  ],
  [
    { name: 'Ledyba', number: '165', evolution: 1 },
    { name: 'Ledian', number: '166', evolution: 2 },
  ],
  [
    { name: 'Spinarak', number: '167', evolution: 1 },
    { name: 'Ariados', number: '168', evolution: 2 },
  ],
  [
    { name: 'Chinchou', number: '170', evolution: 1 },
    { name: 'Lanturn', number: '171', evolution: 2 },
  ],
  [
    { name: 'Togepi', number: '175', evolution: 1, meta: 'baby' },
    { name: 'Togetic', number: '176', evolution: 2 },
  ],
  [
    { name: 'Natu', number: '177', evolution: 1 },
    { name: 'Xatu', number: '178', evolution: 2 },
  ],
  [
    { name: 'Mareep', number: '179', evolution: 1 },
    { name: 'Flaaffy', number: '180', evolution: 2 },
    { name: 'Ampharos', number: '181', evolution: 3 },
  ],
  [
    { name: 'Azurill', number: '298', evolution: 1, meta: 'baby' },
    { name: 'Marill', number: '183', evolution: 2 },
    { name: 'Azumarill', number: '184', evolution: 3 },
  ],
  [
    { name: 'Sudowoodo', number: '185', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Hoppip', number: '187', evolution: 1 },
    { name: 'Skiploom', number: '188', evolution: 2 },
    { name: 'Jumpluff', number: '189', evolution: 3 },
  ],
  [
    { name: 'Aipom', number: '190', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Sunkern', number: '191', evolution: 1, meta: 'needevo' },
    { name: 'Sunflora', number: '192', evolution: 2, meta: 'isevo' },
  ],
  [
    { name: 'Yanma', number: '193', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Wooper', number: '194', evolution: 1 },
    { name: 'Quagsire', number: '195', evolution: 2 },
  ],
  [
    { name: 'Murkrow', number: '198', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Misdreavus', number: '200', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Unown', number: '201', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Wynaut', number: '360', evolution: 1, meta: 'baby' },
    { name: 'Wobbuffet', number: '202', evolution: 2 },
  ],
  [
    { name: 'Girafarig', number: '203', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Pineco', number: '204', evolution: 1 },
    { name: 'Forretress', number: '205', evolution: 2 },
  ],
  [
    { name: 'Dunsparce', number: '206', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Gligar', number: '207', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Snubbull', number: '209', evolution: 1 },
    { name: 'Granbull', number: '210', evolution: 2 },
  ],
  [
    { name: 'Qwilfish', number: '211', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Shuckle', number: '213', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Heracross', number: '214', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Sneasel', number: '215', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Teddiursa', number: '216', evolution: 1 },
    { name: 'Ursaring', number: '217', evolution: 2 },
  ],
  [
    { name: 'Slugma', number: '218', evolution: 1 },
    { name: 'Magcargo', number: '219', evolution: 2 },
  ],
  [
    { name: 'Swinub', number: '220', evolution: 1 },
    { name: 'Piloswine', number: '221', evolution: 2 },
  ],
  [
    { name: 'Corsola', number: '222', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Remoraid', number: '223', evolution: 1 },
    { name: 'Octillery', number: '224', evolution: 2 },
  ],
  [
    { name: 'Delibird', number: '225', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Mantine', number: '226', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Skarmory', number: '227', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Houndour', number: '228', evolution: 1 },
    { name: 'Houndoom', number: '229', evolution: 2 },
  ],
  [
    { name: 'Phanpy', number: '231', evolution: 1 },
    { name: 'Donphan', number: '232', evolution: 2 },
  ],
  [
    { name: 'Stantler', number: '234', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Smeargle', number: '235', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Miltank', number: '241', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Raikou', number: '243', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Entei', number: '244', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Suicune', number: '245', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Larvitar', number: '246', evolution: 1 },
    { name: 'Pupitar', number: '247', evolution: 2 },
    { name: 'Tyranitar', number: '248', evolution: 3 },
  ],
  [
    { name: 'Lugia', number: '249', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Ho-Oh', number: '250', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Celebi', number: '251', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Treecko', number: '252', evolution: 1 },
    { name: 'Grovyle', number: '253', evolution: 2 },
    { name: 'Sceptile', number: '254', evolution: 3 },
  ],
  [
    { name: 'Torchic', number: '255', evolution: 1 },
    { name: 'Combusken', number: '256', evolution: 2 },
    { name: 'Blaziken', number: '257', evolution: 3 },
  ],
  [
    { name: 'Mudkip', number: '258', evolution: 1 },
    { name: 'Marshtomp', number: '259', evolution: 2 },
    { name: 'Swampert', number: '260', evolution: 3 },
  ],
  [
    { name: 'Poochyena', number: '261', evolution: 1 },
    { name: 'Mightyena', number: '262', evolution: 2 },
  ],
  [
    { name: 'Zigzagoon', number: '263', evolution: 1 },
    { name: 'Linoone', number: '264', evolution: 2 },
  ],
  [
    { name: 'Wurmple', number: '265', evolution: 1 },
    { name: 'Silcoon', number: '266', evolution: 2 },
    { name: 'Beautifly', number: '267', evolution: 3 },
    { name: 'Cascoon', number: '268', evolution: 2 },
    { name: 'Dustox', number: '269', evolution: 3 },
  ],
  [
    { name: 'Lotad', number: '270', evolution: 1 },
    { name: 'Lombre', number: '271', evolution: 2 },
    { name: 'Ludicolo', number: '272', evolution: 3 },
  ],
  [
    { name: 'Seedot', number: '273', evolution: 1 },
    { name: 'Nuzleaf', number: '274', evolution: 2 },
    { name: 'Shiftry', number: '275', evolution: 3 },
  ],
  [
    { name: 'Taillow', number: '276', evolution: 1 },
    { name: 'Swellow', number: '277', evolution: 2 },
  ],
  [
    { name: 'Wingull', number: '278', evolution: 1 },
    { name: 'Pelipper', number: '279', evolution: 2 },
  ],
  [
    { name: 'Ralts', number: '280', evolution: 1 },
    { name: 'Kirlia', number: '281', evolution: 2 },
    { name: 'Gardevoir', number: '282', evolution: 3 },
  ],
  [
    { name: 'Surskit', number: '283', evolution: 1 },
    { name: 'Masquerain', number: '284', evolution: 2 },
  ],
  [
    { name: 'Shroomish', number: '285', evolution: 1 },
    { name: 'Breloom', number: '286', evolution: 2 },
  ],
  [
    { name: 'Slakoth', number: '287', evolution: 1 },
    { name: 'Vigoroth', number: '288', evolution: 2 },
    { name: 'Slaking', number: '289', evolution: 3 },
  ],
  [
    { name: 'Nincada', number: '290', evolution: 1 },
    { name: 'Ninjask', number: '291', evolution: 2 },
    { name: 'Shedinja', number: '292', evolution: 3 },
  ],
  [
    { name: 'Whismur', number: '293', evolution: 1 },
    { name: 'Loudred', number: '294', evolution: 2 },
    { name: 'Exploud', number: '295', evolution: 3 },
  ],
  [
    { name: 'Makuhita', number: '296', evolution: 1 },
    { name: 'Hariyama', number: '297', evolution: 2 },
  ],
  [
    { name: 'Nosepass', number: '299', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Skitty', number: '300', evolution: 1 },
    { name: 'Delcatty', number: '301', evolution: 2 },
  ],
  [
    { name: 'Sableye', number: '302', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Mawile', number: '303', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Aron', number: '304', evolution: 1 },
    { name: 'Lairon', number: '305', evolution: 2 },
    { name: 'Aggron', number: '306', evolution: 3 },
  ],
  [
    { name: 'Meditite', number: '307', evolution: 1 },
    { name: 'Medicham', number: '308', evolution: 2 },
  ],
  [
    { name: 'Electrike', number: '309', evolution: 1 },
    { name: 'Manectric', number: '310', evolution: 2 },
  ],
  [
    { name: 'Plusle', number: '311', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Minun', number: '312', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Volbeat', number: '313', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Illumise', number: '314', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Roselia', number: '315', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Gulpin', number: '316', evolution: 1 },
    { name: 'Swalot', number: '317', evolution: 2 },
  ],
  [
    { name: 'Carvanha', number: '318', evolution: 1 },
    { name: 'Sharpedo', number: '319', evolution: 2 },
  ],
  [
    { name: 'Wailmer', number: '320', evolution: 1 },
    { name: 'Wailord', number: '321', evolution: 2 },
  ],
  [
    { name: 'Numel', number: '322', evolution: 1 },
    { name: 'Camerupt', number: '323', evolution: 2 },
  ],
  [
    { name: 'Torkoal', number: '324', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Spoink', number: '325', evolution: 1 },
    { name: 'Grumpig', number: '326', evolution: 2 },
  ],
  [
    { name: 'Spinda', number: '327', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Trapinch', number: '328', evolution: 1 },
    { name: 'Vibrava', number: '329', evolution: 2 },
    { name: 'Flygon', number: '330', evolution: 3 },
  ],
  [
    { name: 'Cacnea', number: '331', evolution: 1 },
    { name: 'Cacturne', number: '332', evolution: 2 },
  ],
  [
    { name: 'Swablu', number: '333', evolution: 1 },
    { name: 'Altaria', number: '334', evolution: 2 },
  ],
  [
    { name: 'Zangoose', number: '335', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Seviper', number: '336', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Lunatone', number: '337', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Solrock', number: '338', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Barboach', number: '339', evolution: 1 },
    { name: 'Whiscash', number: '340', evolution: 2 },
  ],
  [
    { name: 'Corphish', number: '341', evolution: 1 },
    { name: 'Crawdaunt', number: '342', evolution: 2 },
  ],
  [
    { name: 'Baltoy', number: '343', evolution: 1 },
    { name: 'Claydol', number: '344', evolution: 2 },
  ],
  [
    { name: 'Lileep', number: '345', evolution: 1 },
    { name: 'Cradily', number: '346', evolution: 2 },
  ],
  [
    { name: 'Anorith', number: '347', evolution: 1 },
    { name: 'Armaldo', number: '348', evolution: 2 },
  ],
  [
    { name: 'Feebas', number: '349', evolution: 1 },
    { name: 'Milotic', number: '350', evolution: 2 },
  ],
  [
    { name: 'Castform', number: '351', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Kecleon', number: '352', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Shuppet', number: '353', evolution: 1 },
    { name: 'Banette', number: '354', evolution: 2 },
  ],
  [
    { name: 'Duskull', number: '355', evolution: 1 },
    { name: 'Dusclops', number: '356', evolution: 2 },
  ],
  [
    { name: 'Tropius', number: '357', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Chimecho', number: '358', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Absol', number: '359', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Snorunt', number: '361', evolution: 1 },
    { name: 'Glalie', number: '362', evolution: 2 },
  ],
  [
    { name: 'Spheal', number: '363', evolution: 1 },
    { name: 'Sealeo', number: '364', evolution: 2 },
    { name: 'Walrein', number: '365', evolution: 3 },
  ],
  [
    { name: 'Clamperl', number: '366', evolution: 1 },
    { name: 'Huntail', number: '367', evolution: 2 },
    { name: 'Gorebyss', number: '368', evolution: 2 },
  ],
  [
    { name: 'Relicanth', number: '369', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Luvdisc', number: '370', evolution: 1, meta: 'nohigher' },
  ],
  [
    { name: 'Bagon', number: '371', evolution: 1 },
    { name: 'Shelgon', number: '372', evolution: 2 },
    { name: 'Salamence', number: '373', evolution: 3 },
  ],
  [
    { name: 'Beldum', number: '374', evolution: 1 },
    { name: 'Metang', number: '375', evolution: 2 },
    { name: 'Metagross', number: '376', evolution: 3 },
  ],
  [
    { name: 'Regirock', number: '377', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Regice', number: '378', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Registeel', number: '379', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Latias', number: '380', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Latios', number: '381', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Kyogre', number: '382', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Groudon', number: '383', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Rayquaza', number: '384', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Jirachi', number: '385', evolution: 1, meta: 'legend' },
  ],
  [
    { name: 'Deoxys', number: '386', evolution: 1, meta: 'legend' },
  ],
];
