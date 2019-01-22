class _PrimeDataScript_Character_Common_PetController_Controller {
  constructor(script) {
    this.script = script;
  }
  
  OnInit() {
    this.rig = this.script.GetParent();
  }
  
  OnInitPet(map, petId) {
    this.map = map;
    this.petId = petId;
  }
  
  GetPetId() {
    return this.petId;
  }
  
  GetPet() {
    return this.GetMap().GetPet(this.GetPetId());
  }

  GetMap() {
    return this.map;
  }
  
  GetModel() {
    return this.GetMap().GetModel();
  }
  
  GetCommands(gameState) {
    var map = this.GetMap();
    var pet = map.GetPet(this.petId);
    var skills = pet.GetSkills();
    
    var result = [];
    
    for(var i = 0; i < skills.length; i++) {
      var skillId = skills[i];
      var skill = map.GetSkill(skillId);
      var command = skill.GetCommand(gameState);
      if(command) {
        result.push(command);
      }
    }
    
    return result;
  }

  GetSkillAnimConfig(skillId) {
    var map = this.GetMap();
    var skill = map.GetSkill(skillId);
    var skillContent = skill.GetContent();
    
    if(skillContent.path == '/Pack/Core/Skill/Defend/Skill.json') {
      return {
        action: 'idle',
        impactTimes: [0.2],
        animDuration: 0.8,
      }
    }
  }
  
  GenerateMultipleImpactTimes(start, end, count) {
    var impactTimes = [];
    var impactTimeStart = 0.54212;
    var impactTimeEnd = 1.02946;
    var impactCount = 5;
    var impactTimeTimeSep = (impactTimeEnd - impactTimeStart) / (impactCount - 1);
    for(var i = 0; i < impactCount; i++) {
      impactTimes.push(impactTimeStart + impactTimeTimeSep * i);
    }
    return impactTimes;
  }
};
