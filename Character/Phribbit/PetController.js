//#include '/Character/Common/PetController/Controller.json'

class _PrimeDataScript_Character_Phribbit_PetController extends _PrimeDataScript_Character_Common_PetController_Controller {
  GetSkillAnimConfig(skillId) {
    var map = this.GetMap();
    var skill = map.GetSkill(skillId);
    var skillContent = skill.GetContent();
    
    if(skillContent.path == '/Pack/Core/Skill/FinSlap/Skill.json') {
      return {
        action: 'fin',
        impactTimes: this.GenerateMultipleImpactTimes(0.33289, 1.01711, 3),
      }
    }
    else if(skillContent.path == '/Pack/Core/Skill/Expand/Skill.json') {
      return {
        action: 'expand',
        impactTimes: [1.11328],
      }
    }
    else if(skillContent.path == '/Pack/Core/Skill/Swim/Skill.json') {
      return {
        action: 'swim',
        impactTimes: [1.65948],
      }
    }
    else if(skillContent.path == '/Pack/Core/Skill/BubbleBlast/Skill.json') {
      return {
        action: 'wave',
        impactTimes: [0.68675],
      }
    }
    else if(skillContent.path == '/Pack/Core/Skill/TidalWave/Skill.json') {
      return {
        action: 'wave',
        impactTimes: [0.68675],
      }
    }
    else if(skillContent.path == '/Pack/Core/Skill/Tsunami/Skill.json') {
      return {
        action: 'tsunami',
        impactTimes: [0.93774],
      }
    }
    
    return super.GetSkillAnimConfig(skillId);
  }
};
