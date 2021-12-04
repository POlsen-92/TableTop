import React, { useState } from "react";
import ReactTooltip from "react-tooltip";
import API from "../../../utils/API";
import { useNavigate } from "react-router-dom";
import { DiceRoll } from "rpg-dice-roller";
import useSound from "use-sound";
import rollSound from "../Dice/diceSound.mp3";
import { randomNameGenerator } from "./Namegen";
import { Editor } from "@tinymce/tinymce-react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";


let customDie = "choose";

export default function Homebrew({
  characterInfo,
  setCharacterInfo,
  token,
  proficiencies,
  classapiResponse,
  apiResponse,
  subraceResponse,
}) {
  const navigate = useNavigate();
  const [play] = useSound(rollSound);
  const [show, setShow] = useState(false);
  const [error, setError] = useState(false);
  const [noClass, setNoClass] = useState(false);
  const [rollingThunda, setRollingThunda] = useState({
    strength: 0,
    dexterity: 0,
    constitution: 0,
    intelligence: 0,
    wisdom: 0,
    charisma: 0,
    hitpoints: 0,
  });

  const handleBackgroundChange = (e) => {
    console.log("Content was updated:", e.target.getContent());
    setCharacterInfo({
      ...characterInfo,
      background: e.target.getContent(),
    });
  };
  const handlePersonalityChange = (e) => {
    console.log("Content was updated:", e.target.getContent());
    setCharacterInfo({
      ...characterInfo,
      personality: e.target.getContent(),
    });
  };
  const handleAlignmentChange = (e) => {
    console.log("Content was updated:", e.target.getContent());
    setCharacterInfo({
      ...characterInfo,
      alignment: e.target.getContent(),
    });
  };

  const handleCharacterChange = (e) => {
    const { name, value } = e.target;
    setCharacterInfo({
      ...characterInfo,
      [name]: value,
    });
  };

  const randomName = () => {
    setCharacterInfo({
      ...characterInfo,
      charName: randomNameGenerator("sV'i"),
    });
  };

  const calculateHitpoints = () => {
    setCharacterInfo({
      ...characterInfo,
      hitpoints: 0,
    });
    if (!classapiResponse.hit_die) {
      setNoClass(true);
      customDie = document.getElementById("sides").value;
      if (customDie === "choose") return;
    }
    setNoClass(false);
    document.getElementById("sides").selectedIndex = 0;
    const roll1 = new DiceRoll(
      1 + "d" + (classapiResponse.hit_die || customDie)
    );
    customDie = "choose";
    play();
    const moving = setInterval(() => {
      setRollingThunda({
        ...rollingThunda,
        hitpoints: Math.floor(1 + Math.random() * 10),
      });
    }, 10);
    setTimeout(() => {
      clearInterval(moving);
      
      setCharacterInfo({
        ...characterInfo,
        hitpoints: parseInt(roll1.output
          .split("[")
          .pop()
          .split("]")[0]
          .split(","))
      });
    }, 2300);
  };

  // const checkBonus = (bonus) => {
  //   console.log(bonus);
  //   console.log(characterInfo.race, characterInfo.subrace);

  //   switch (bonus) {
  //     case "strength":
  //       if (characterInfo.race === "Dragonborn" || "Half-Orc") {
  //         setTimeout(() => {
  //           setCharacterInfo({
  //             ...characterInfo,
  //             strength: characterInfo.strength + 2,
  //           });
  //         }, 1000);
  //       } else if (characterInfo.race === "Human") {
  //         setTimeout(() => {
  //           setCharacterInfo({
  //             ...characterInfo,
  //             strength: characterInfo.strength + 1,
  //           });
  //         }, 1000);
  //       }
  //       break;
  //     default:
  //       console.log("default");
  //       break;
  //   }
  // };

  const calculateAttributes = (e) => {
    
    const roll1 = new DiceRoll("4d6");
    console.log(roll1.output);
    let output = roll1.output
      .split("[")
      .pop()
      .split("]")[0]
      .split(",")
      .map(function (item) {
        return parseInt(item, 10);
      });
    const min = Math.min(...output);
    let location = output.indexOf(min);
    output.splice(location, 1);
    const total = output.reduce((partial, item) => partial + item);
    console.log(total);
    play();
    const moving = setInterval(() => {
      setRollingThunda({
        ...rollingThunda,
        [e.target.value]: Math.floor(1 + Math.random() * 10),
      });
    }, 10);
    setTimeout(() => {
      clearInterval(moving);

      setCharacterInfo({
        ...characterInfo,
        [e.target.value]: total,
      });
      // checkBonus(e.target.value);
    }, 2300);
  };

  const handleClose = (e) => {
    if (!e) {
      setShow(false);
      setError(false);
    } else if (e.target.textContent === "Close") {
      setShow(false);
      setError(false);
    } else {
      const campaignId = window.location.toString().split("/")[
        window.location.toString().split("/").length - 1
      ];
      API.createCharacter(characterInfo, campaignId, token).then((res) => {
        console.log(res.data.id);
        console.log(res.data);
        if (proficiencies) {
          proficiencies.map((items) => {
            const data = {
              name: items,
            };
            API.createNewProficiency(res.data.id, data, token).then((res) => {
              console.log(res.data);
              navigate(`/campaign/${campaignId}`);
            });
          });
        }
        navigate(`/campaign/${campaignId}`);
      });
    }
  };

  const handleShow = () => {
    if (characterInfo.charName !== "") {
      setShow(true);
    } else {
      setError(true);
    }
  };

  return (
    <div>
      <button variant="secondary" size="sm" onClick={handleShow}>
        Save
      </button>
      {"    "}
      <button
        variant="secondary"
        size="sm"
        onClick={() => {
          window.location.reload();
        }}
      >
        Reset
      </button>

      <div className="container">
        <div className="row row-cols-sm-1 row-cols-md-2 row-cols-lg-4 g-4">
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Character Name / Age</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="text"
                    onChange={handleCharacterChange}
                    name="charName"
                    value={characterInfo.charName}
                    className="bg-transparent"
                  />
                </p>
                <p>
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="age"
                    value={characterInfo.age}
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
                <button
                  onClick={randomName}
                  variant="secondary"
                  size="lg"
                >
                  Random
                </button>
              </div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Race / Subrace</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="text"
                    onChange={handleCharacterChange}
                    name="race"
                    value={characterInfo.race}
                    className="bg-transparent"
                  />
                </p>
                <p className="card-text">
                  <input
                    type="text"
                    onChange={handleCharacterChange}
                    name="subRace"
                    value={characterInfo.subRace}
                    className="bg-transparent"
                  />
                </p>
                <div>
                  {apiResponse.ability_bonuses
                    ? apiResponse.ability_bonuses.map((bonus, index) => {
                        return (
                          <p key={index}>
                            {bonus.ability_score.name}:{bonus.bonus}
                          </p>
                        );
                      })
                    : null}
                  {subraceResponse.ability_bonuses
                    ? subraceResponse.ability_bonuses.map((bonus, index) => {
                        return (
                          <p key={index}>
                            {bonus.ability_score.name}:{bonus.bonus}
                          </p>
                        );
                      })
                    : null}
                </div>
              </div>
              <div className="card-footer bg-transparent"></div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Class / Subclass</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="text"
                    onChange={handleCharacterChange}
                    name="class"
                    value={characterInfo.class}
                    className="bg-transparent"
                  />
                </p>
                <p className="card-text">
                  <input
                    type="text"
                    onChange={handleCharacterChange}
                    name="subClass"
                    value={characterInfo.subClass}
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent"></div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Proficiencies</div>
              <div className="card-body">
                <ul className="list-group list-group-flush">
                  {proficiencies.map((items, index) => {
                    return (
                      <li
                        key={index}
                        className="list-group-item bg-transparent"
                      >
                        {items}
                      </li>
                    );
                  })}
                </ul>
              </div>
              <div className="card-footer bg-transparent"></div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Level</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="text"
                    onChange={handleCharacterChange}
                    name="level"
                    value={characterInfo.level}
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent"></div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Speed</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="speed"
                    value={characterInfo.speed}
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent"></div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Hitpoints</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="hitpoints"
                    value={
                      characterInfo.hitpoints
                        ? characterInfo.hitpoints
                        : rollingThunda.hitpoints
                    }
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
                <div className={noClass ? "" : "hide"}>
                  Choose a class on the class screen or provide the number of
                  sides you want to use:
                  <select name="sides" id="sides">
                    <option key="22" value="choose">
                      Choose
                    </option>
                    <option key="33" value="4">
                      4 Sides
                    </option>
                    <option key="44" value="6">
                      6 Sides
                    </option>
                    <option key="55" value="8">
                      8 Sides
                    </option>
                    <option key="66" value="10">
                      10 Sides
                    </option>
                    <option key="77" value="12">
                      12 Sides
                    </option>
                    <option key="88" value="20">
                      20 Sides
                    </option>
                  </select>
                </div>

                {!rollingThunda.hitpoints ? <button
                  data-tip
                  data-for="hitpointsButton"
                  className="btn btn-primary"
                  onClick={calculateHitpoints}
                >
                  Calculate
                </button> : null}
                <ReactTooltip className="tooltip" id="hitpointsButton">
                  <p>1d{classapiResponse.hit_die}</p>
                  <p>
                    Your character's hit points define how tough your character
                    is in combat and other dangerous situations. Your <br />
                    hit points are determined by your Hit Dice. At 1st level,
                    your character has 1 Hit Die and the die type is <br />
                    determined by your class. You start with hit points equal to
                    the highest roll of that die, as indicated in your class
                    <br />
                    description.
                  </p>
                </ReactTooltip>
              </div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Strength</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="strength"
                    value={
                      characterInfo.strength
                        ? characterInfo.strength
                        : rollingThunda.strength
                    }
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
              {!rollingThunda.strength ? <button
                  data-tip
                  data-for="strengthButton"
                  className="btn btn-primary"
                  onClick={calculateAttributes}
                  value="strength"
                >
                  Calculate
                </button> : null}
                <ReactTooltip className="tooltip" id="strengthButton">
                  <p>
                    Each score is generated randomly by using the sum of the
                    highest 3 out of 4 rolls of a 6 sided dice (4d6).
                  </p>
                  <p>
                    Strength measures bodily power, athletic training, and the
                    extent to which you can exert raw physical force.
                    <br />
                    A Strength check can model any attempt to lift, push, pull,
                    or break something, to force your body through a space,
                    <br />
                    or to otherwise apply brute force to a situation. The
                    Athletics skill reflects aptitude in certain kinds of
                    Strength checks.
                  </p>
                </ReactTooltip>
              </div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Dexterity</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="dexterity"
                    value={
                      characterInfo.dexterity
                        ? characterInfo.dexterity
                        : rollingThunda.dexterity
                    }
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
              {!rollingThunda.dexterity ? <button
                  data-tip
                  data-for="dexterityButton"
                  className="btn btn-primary"
                  onClick={calculateAttributes}
                  value="dexterity"
                >
                  Calculate
                </button> : null}
                <ReactTooltip className="tooltip" id="dexterityButton">
                  <p>
                    Each score is generated randomly by using the sum of the
                    highest 3 out of 4 rolls of a 6 sided dice (4d6).
                  </p>
                  <p>
                    Dexterity measures agility, reflexes, and balance. A
                    Dexterity check can model any attempt to move
                    <br />
                    nimbly, quickly, or quietly, or to keep from falling on
                    tricky footing. The Acrobatics, Sleight of Hand, <br />
                    and Stealth skills reflect aptitude in certain kinds of
                    Dexterity checks.
                  </p>
                </ReactTooltip>
              </div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Constitution</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="constitution"
                    value={
                      characterInfo.constitution
                        ? characterInfo.constitution
                        : rollingThunda.constitution
                    }
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
              {!rollingThunda.constitution ? <button
                  data-tip
                  data-for="constitutionButton"
                  className="btn btn-primary"
                  onClick={calculateAttributes}
                  value="constitution"
                >
                  Calculate
                </button> : null }
                <ReactTooltip className="tooltip" id="constitutionButton">
                  <p>
                    Each score is generated randomly by using the sum of the
                    highest 3 out of 4 rolls of a 6 sided dice (4d6).
                  </p>
                  <p>
                    Constitution measures health, stamina, and vital force.
                    Constitution checks are uncommon,
                    <br />
                    and no skills apply to Constitution checks, because the
                    endurance this ability represents is
                    <br />
                    largely passive rather than involving a specific effort on
                    the part of a character or monster.
                  </p>
                </ReactTooltip>
              </div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Intelligence</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="intelligence"
                    value={
                      characterInfo.intelligence
                        ? characterInfo.intelligence
                        : rollingThunda.intelligence
                    }
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
              {!rollingThunda.intelligence ? <button
                  data-tip
                  data-for="intelligenceButton"
                  className="btn btn-primary"
                  onClick={calculateAttributes}
                  value="intelligence"
                >
                  Calculate
                </button> : null}
                <ReactTooltip className="tooltip" id="intelligenceButton">
                  <p>
                    Each score is generated randomly by using the sum of the
                    highest 3 out of 4 rolls of a 6 sided dice (4d6).
                  </p>
                  <p>
                    Intelligence measures mental acuity, accuracy of recall, and
                    the ability to reason. An Intelligence
                    <br />
                    check comes into play when you need to draw on logic,
                    education, memory, or deductive reasoning. <br />
                    The Arcana, History, Investigation, Nature, and Religion
                    skills reflect aptitude in certain kinds of <br />
                    Intelligence checks.
                  </p>
                </ReactTooltip>
              </div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Wisdom</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="wisdom"
                    value={
                      characterInfo.wisdom
                        ? characterInfo.wisdom
                        : rollingThunda.wisdom
                    }
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
              {!rollingThunda.wisdom ? <button
                  data-tip
                  data-for="wisdomButton"
                  className="btn btn-primary"
                  onClick={calculateAttributes}
                  value="wisdom"
                >
                  Calculate
                </button> : null }
                <ReactTooltip className="tooltip" id="wisdomButton">
                  <p>
                    Each score is generated randomly by using the sum of the
                    highest 3 out of 4 rolls of a 6 sided dice (4d6).
                  </p>
                  <p>
                    Wisdom reflects how attuned you are to the world around you
                    and represents perceptiveness and intuition.
                    <br />
                    A Wisdom check might reflect an effort to read body
                    language, understand someone's feelings, notice <br />
                    things about the environment, or care for an injured person.
                    The Animal Handling, Insight, Medicine, <br />
                    Perception, and Survival skills reflect aptitude in certain
                    kinds of Wisdom checks.
                  </p>
                </ReactTooltip>
              </div>
            </div>
          </div>
          <div className="col">
            <div
              className="card bg-transparent h-100"
              style={{ width: "18rem" }}
            >
              <div className="card-header">Charisma</div>
              <div className="card-body">
                <p className="card-text">
                  <input
                    type="number"
                    onChange={handleCharacterChange}
                    name="charisma"
                    value={
                      characterInfo.charisma
                        ? characterInfo.charisma
                        : rollingThunda.charisma
                    }
                    className="bg-transparent"
                  />
                </p>
              </div>
              <div className="card-footer bg-transparent">
              {!rollingThunda.charisma ? <button
                  data-tip
                  data-for="charismaButton"
                  className="btn btn-primary"
                  onClick={calculateAttributes}
                  value="charisma"
                >
                  Calculate
                </button> : null }
                <ReactTooltip className="tooltip" id="charismaButton">
                  <p>
                    Each score is generated randomly by using the sum of the
                    highest 3 out of 4 rolls of a 6 sided dice (4d6).
                  </p>
                  <p>
                    Charisma measures your ability to interact effectively with
                    others. It includes such factors as confidence <br />
                    and eloquence, and it can represent a charming or commanding
                    personality. A Charisma check might arise when <br />
                    you try to influence or entertain others, when you try to
                    make an impression or tell a convincing lie, or <br />
                    when you are navigating a tricky social situation. The
                    Deception, Intimidation, Performance, and Persuasion <br />
                    skills reflect aptitude in certain kinds of Charisma checks.
                  </p>
                </ReactTooltip>
              </div>
            </div>
          </div>
          {/* </div> */}
        </div>
        <div className="row justify-content-center">
          <div data-tip data-for="background">
            <h2>Background</h2>
          </div>
          <ReactTooltip className="tooltip" id="background">
            <p>
              Every story has a beginning. Your character's background reveals
              where you came from, how you became an adventurer, and your place
              in the world. Your fighter might have been a courageous knight or
              a grizzled soldier. Your wizard could have been a sage or an
              artisan. Your rogue might have gotten by as a guild thief or
              commanded audiences as a jester. Choosing a background provides
              you with important story cues about your character's identity.
            </p>
          </ReactTooltip>
          <Editor
            initialValue="<p>Write your story here!</p>"
            apiKey={process.env.REACT_APP_TINYAPI}
            init={{
              height: 300,
              width: "80%",
              menubar: true,
              skin: "oxide-dark",
              content_css: "dark",
              plugins: [
                "advlist autolink lists link image",
                "charmap print preview anchor help",
                "searchreplace visualblocks code",
                "insertdatetime media table paste wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic | \
            alignleft aligncenter alignright | \
            bullist numlist outdent indent image | help",
            }}
            onChange={handleBackgroundChange}
          />
        </div>
        <div className="row justify-content-center">
          <div data-tip data-for="personality">
            <h2>Personality</h2>
          </div>
          <ReactTooltip className="tooltip" id="personality">
            <p>
              Fleshing out your character's personality--the array of traits,
              mannerisms, habits, bliefs, and flaws that give a person a unique
              identity--will help you bring them to life as you play the game.
            </p>
          </ReactTooltip>
          <Editor
            initialValue="<p>What is your character's personality?</p>"
            apiKey={process.env.REACT_APP_TINYAPI}
            init={{
              height: 300,
              width: "80%",
              menubar: true,
              skin: "oxide-dark",
              content_css: "dark",
              plugins: [
                "advlist autolink lists link image",
                "charmap print preview anchor help",
                "searchreplace visualblocks code",
                "insertdatetime media table paste wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic | \
            alignleft aligncenter alignright | \
            bullist numlist outdent indent image | help",
            }}
            onChange={handlePersonalityChange}
          />
        </div>
        <div className="row justify-content-center">
          <div data-tip data-for="alignment">
            <h2>Alignment</h2>
          </div>

          <ReactTooltip className="tooltip" id="alignment">
            <p>
              A typical creater in the world has an alignment, which boradly
              describes its moral and personal attitudes. Alignment is a
              combination of two factors: one identifies morality (good, evil,
              or neutral), and the other describes attitudes toward society and
              order (lawful, chaotic, and neutral).
            </p>
          </ReactTooltip>
          <Editor
            initialValue="<p>What is your character's alignment?</p>"
            apiKey={process.env.REACT_APP_TINYAPI}
            init={{
              height: 300,
              width: "80%",
              menubar: true,
              skin: "oxide-dark",
              content_css: "dark",
              plugins: [
                "advlist autolink lists link image",
                "charmap print preview anchor help",
                "searchreplace visualblocks code",
                "insertdatetime media table paste wordcount",
              ],
              toolbar:
                "undo redo | formatselect | bold italic | \
            alignleft aligncenter alignright | \
            bullist numlist outdent indent image | help",
            }}
            onChange={handleAlignmentChange}
          />
        </div>
      </div>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Save?</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure? Once you save you won't be able to edit the race and
          class.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={error} onHide={handleClose}>
        <Modal.Header>
          <Modal.Title>Error!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          The character's name needs to be filled out before saving.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <br />
      <br />
      <br />
    </div>
  );
}
