class _PrimeDataScript_Character_Common_Controller_Controller {
  constructor(script) {
    this.script = script;
    
    this.UVThreshold = 10;
    this.UVThresholdHP = this.UVThreshold;
    this.UVThresholdATK = this.UVThreshold;
    this.UVThresholdDEF = this.UVThreshold;
    this.UVThresholdAGI = this.UVThreshold;
    this.UVThresholdSPC = this.UVThreshold;
    this.UVBonesHP = [];
    this.UVBonesATK = [];
    this.UVBonesDEF = [];
    this.UVBonesAGI = [];
    this.UVBonesINT = [];
    this.UVBonesSPC = [];
  }

  OnInit() {
    this.rig = this.script.GetParent();
    this.mainObj = this.rig.children.Get('Main');
    this.arena = this.rig.GetParentByClassName('Arena');
    this.gameMechanics = Prime.GetObject('Game.Mechanics');
    this.stats = null;
    
    this.smokePS = this.GetParticleSystem('ParticleSystem.Smoke');
    
    this.mainObj.AddScriptListener(this.script);
  }
  
  OnCalc(dt) {
    
  }
  
  OnEnterAction(obj, name, dt) {
    var functionName = 'OnEnterAction_' + name;
    if(this[functionName]) {
      this[functionName](dt);
    }
  }
  
  OnExitAction(obj, name, dt) {
    var functionName = 'OnExitAction_' + name;
    if(this[functionName]) {
      this[functionName](dt);
    }
  }
  
  OnCalcAction(obj, name, dt) {
    var functionName = 'OnCalcAction_' + name;
    if(this[functionName]) {
      this[functionName](dt);
    }
  }

  UpdateStats(stats) {
    this.stats = stats;
    
    var self = this;
    this.mainObj.WaitForSkinset(function(skeleton) {
      var addSkinsets = {};
      
      var rng = new Prime.Random();
      rng.Seed(stats['genes']);

      if(stats['uvHP'] >= self.UVThresholdHP && self.UVBonesHP) {
        var alt = self.GetAltSkinset(rng);
        if(alt) {
          self.AddAltSkinset(addSkinsets, alt, self.UVBonesHP);
        }
      }
      
      if(stats['uvATK'] >= self.UVThresholdATK && self.UVBonesATK) {
        var alt = self.GetAltSkinset(rng);
        if(alt) {
          self.AddAltSkinset(addSkinsets, alt, self.UVBonesATK);
        }
      }
      
      if(stats['uvDEF'] >= self.UVThresholdDEF && self.UVBonesDEF) {
        var alt = self.GetAltSkinset(rng);
        if(alt) {
          self.AddAltSkinset(addSkinsets, alt, self.UVBonesDEF);
        }
      }
      
      if(stats['uvAGI'] >= self.UVThresholdAGI && self.UVBonesAGI) {
        var alt = self.GetAltSkinset(rng);
        if(alt) {
          self.AddAltSkinset(addSkinsets, alt, self.UVBonesAGI);
        }
      }
      
      if(stats['uvINT'] >= self.UVThresholdINT && self.UVBonesINT) {
        var alt = self.GetAltSkinset(rng);
        if(alt) {
          self.AddAltSkinset(addSkinsets, alt, self.UVBonesINT);
        }
      }
      
      if(stats['uvSPC'] >= self.UVThresholdSPC && self.UVBonesSPC) {
        var alt = self.GetAltSkinset(rng);
        if(alt) {
          self.AddAltSkinset(addSkinsets, alt, self.UVBonesSPC);
        }
      }

      for(var key in addSkinsets) {
        if(addSkinsets.hasOwnProperty(key)) {
          var activeBones = addSkinsets[key];
          if(activeBones.length > 0) {
            skeleton.AddAdditionalSkinset(key, activeBones);
          }
        }
      }
    });
  }
  
  GetAltSkinset(rng) {
    if(this.AltSkinsets && this.AltSkinsets.length > 0) {
      return this.AltSkinsets[rng.GetValue() % this.AltSkinsets.length];
    }
    
    return null;
  }
  
  AddAltSkinset(data, skinset, bones) {
    var activeBones = data[skinset];
    if(!activeBones) {
      activeBones = [];
      data[skinset] = activeBones;
    }
    
    for(var i = 0; i < bones.length; i++) {
      var bone = bones[i];
      activeBones.push(bone);
    }
    
    return activeBones;
  }
  
  GetParticleSystem(name) {
    if(this.arena) {
      return this.arena.children.Get(name);
    }
    else {
      return Prime.GetObject(name);
    }
  }
};
