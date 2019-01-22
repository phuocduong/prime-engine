//#include '/Character/Common/Controller/Controller.json'

class _PrimeDataScript_Character_Phribbit_Controller extends _PrimeDataScript_Character_Common_Controller_Controller {
  constructor(script) {
    super(script);
    
    this.AltSkinsets = [
      '/Character/Phribbit/Skin2/Skinset.pcd',
    ];
    
    this.UVBonesHP = [
      'arm1a',
      'arm2a',
      'arm1b',
      'arm2b',
    ];
    
    this.UVBonesATK = [
      'tail',
    ];
    
    this.UVBonesDEF = [
      'body',
    ];
    
    this.UVBonesAGI = [
      'leg1a',
      'leg1b',
      'leg2a',
      'leg2b',
    ];
  }
};
