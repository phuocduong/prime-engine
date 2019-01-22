////////////////////////////////////////////////////////////////////////////////
//
// Prime Engine
// Copyright 2011-2018 Sean Reid
//
// This file and/or data is a part of Prime Engine.  Prime Engine is owned by
// Sean Reid.  A valid license is required to use Prime Engine in any form
// including, but not limited to, commercial and/or educational use.
// For more information about Prime Engine, visit:
//
//   http://seanreid.ca
//
////////////////////////////////////////////////////////////////////////////////

var Prime = {};

Prime.Pi        = 3.14159265358979323846;
Prime.TwoPi     = 6.28318530717958647692;
Prime.PiBy2     = (Prime.Pi / 2.0);
Prime.PiBy4     = (Prime.Pi / 4.0);
Prime.PiBy8     = (Prime.Pi / 8.0);
Prime.PiBy180   = (Prime.Pi / 180.0);

Prime.AlignNone       = 0       // no alignment
Prime.AlignTop        = 0x01    // vertical top alignment
Prime.AlignBottom     = 0x02    // vertical bottom alignment
Prime.AlignVCenter    = 0x04    // vertical center alignment
Prime.AlignLeft       = 0x08    // horizontal left alignment
Prime.AlignRight      = 0x10    // horizontal right alignment
Prime.AlignHCenter    = 0x20    // horizontal center alignment
Prime.AlignCenter     = (Prime.AlignHCenter | Prime.AlignVCenter);

Prime.DPrintEnabled = true;

Prime.DPrint = function(msg) {
  if(Prime.DPrintEnabled) {
    console.log(msg);
  }
};

Prime.Assert = function(b, msg) {
  if(!b) {
    var e = new Error(msg);
    Prime.DPrint(e);
    
    if(Prime.CrashlogURL) {
      var crashlogData = e;
      if(Prime.CrashlogURLCallback) {
        crashlogData = Prime.CrashlogURLCallback(crashlogData);
      }
      jQuery.ajax({
        url: Prime.CrashlogURL,
        method: "POST",
        cache: false,
        data: crashlogData,
        success: function(data) {
          
        },
        error: function(xhr, status, err) {
          
        },
      });
    }
        
    alert('Assertion failed:\n' + e);
    throw e;
  }
};

Prime.Breakpoint = function(value) {
  
};

Prime.Object = class {
  constructor() {
    this.info = new Prime.ODInfo(this);
    this.transform = new Prime.ODTransform(this);
    this.children = new Prime.ODChildren(this);
    this.visibility = new Prime.ODVisibility(this);
  }
  
  GetParent(level = 0) {
    return this.info.parent;
  }
  
  GetParentByClass(cls) {
    var parent = this.GetParent();
    if(parent) {
      if(parent instanceof cls) {
        return parent;
      }
      else {
        return parent.GetParentByClass(cls);
      }
    }
    else {
      return null;
    }
  }
  
  GetParentByClassName(name) {
    var parent = this.GetParent();
    if(parent) {
      if(parent.constructor.name == name) {
        return parent;
      }
      else {
        return parent.GetParentByClassName(name);
      }
    }
    else {
      return null;
    }
  }
  
  ChangeParent(parent) {
    Prime.Assert(parent, 'Cannot change to null parent.');

    if(this.info.parent) {
      this.OnRemovedFromParent(this.info.parent);
      this.info.parent.children.Remove(this);
      this.info.parent = null;
    }
    
    parent.children.Add(this);
    this.OnAddedToParent(parent);
  }
  
  Init() {
    
  }
  
  Destroy() {
    if(!this.info.destroy) {
      this.info.destroy = true;
      Prime.AddDestroyedObject(this);
    }
  }

  Calc(dt) {
    if(this.IsProcessableForChildren()) {
      this.children.Calc(dt);
    }
    
    if(this.IsProcessable()) {
      this.OnCalc(dt);
    }
  }
  
  IsProcessable() {
    return true;
  }
  
  IsProcessableForChildren() {
    return true;
  }

  OnCalc(dt) {
    
  }
  
  OnRemovedFromParent(parent) {
    
  }
  
  OnAddedToParent(parent) {
    
  }
  
  OnTransformNodeUpdated() {
    
  }
  
  Create(cls) {
    var object = new cls();
    this.children.Add(object);
    object.Init();
    return object;
  }
  
  Execute(scriptPath, readyCallback = null) {
    var script = this.Create(Prime.Script);
    script.SetContent(scriptPath, readyCallback);
    return script;
  }
};

Prime.ManagedRoot = class extends Prime.Object {
  IsProcessible() {
    return false;
  }
  
  IsProcessableForChildren() {
    return false;
  }  
};

Prime.ODInfo = class {
  constructor(object) {
    this.object = object;
    this.parent = null;
    this.name = '';
    this.destroy = false;
  }
  
  IsName(name) {
    return this.name == name;
  }
  
  SetName(name) {
    Prime.ObjectsByName[name] = this.object;
    this.name = name;
    $(this.object.transform.node).attr('id', this.name);
  }
};

Prime.ODTransform = class {
  constructor(object) {
    this.node = document.createElement('div');
    $(this.node).attr('style', 'position: absolute;');

    this.object = object;
    this.pos = new Prime.Vec3();
    this.scale = new Prime.Vec3(1, 1, 1);
    this.angle = new Prime.Vec3();
    this.hflip = false;
    this.vflip = false;
    this.zIndex = 0;
  }
  
  SetPos(x = 0, y = 0, z = 0) {
    this.pos.x = x;
    this.pos.y = y;
    this.pos.z = z;
    this.UpdateNode();
  }
  
  SetPosX(x) {
    this.pos.x = x;
    this.UpdateNode();
  }
  
  SetPosY(y) {
    this.pos.y = y;
    this.UpdateNode();
  }
  
  SetPosZ(z) {
    this.pos.z = z;
    this.UpdateNode();
  }
  
  SetPosXY(x, y) {
    this.pos.x = x;
    this.pos.y = y;
    this.UpdateNode();
  }

  SetScale(x = 0, y = 0, z = 0) {
    this.scale.x = x;
    this.scale.y = y;
    this.scale.z = z;
    this.UpdateNode();
  }
  
  SetScaleX(x) {
    this.scale.x = x;
    this.UpdateNode();
  }
  
  SetScaleY(y) {
    this.scale.y = y;
    this.UpdateNode();
  }
  
  SetScaleZ(z) {
    this.scale.y = y;
    this.UpdateNode();
  }
  
  SetScaleXY(x, y) {
    this.scale.x = x;
    this.scale.y = y;
    this.UpdateNode();
  }

  SetAngle(x = 0, y = 0, z = 0) {
    this.angle.x = x;
    this.angle.y = y;
    this.angle.z = z;
    this.UpdateNode();
  }
  
  SetAngleZ(z) {
    this.angle.z = z;
    this.UpdateNode();
  }

  SetUniformScale(scale) {
    this.SetScale(scale, scale, scale);
  }
  
  SetAngle(x = 0, y = 0, z = 0) {
    this.angle.x = x;
    this.angle.y = y;
    this.angle.z = z;
    this.UpdateNode();
  }
  
  SetHFlip(hflip) {
    this.hflip = hflip;
    this.UpdateNode();
  }
  
  SetVFlip(vflip) {
    this.vflip = vflip;
    this.UpdateNode();
  }
  
  SetZIndex(zIndex) {
    this.zIndex = zIndex;
    this.UpdateNode();
  }

  GetHFlip() {
    return this.hflip;
  }

  GetVFlip() {
    return this.vflip;
  }
  
  GetHFlipDir() {
    return this.hflip ? -1 : 1;
  }
  
  GetVFlipDir() {
    return this.vflip ? -1 : 1;
  }
  
  GetHFlipToRoot() {
    var parent = this.object.GetParent();
    var result = this.hflip;
    while(parent) {
      result = result != parent.transform.hflip;
      parent = parent.GetParent();
    }
    return result;
  }
  
  GetVFlipToRoot() {
    var parent = this.object.GetParent();
    var result = this.vflip;
    while(parent) {
      result = result != parent.transform.vflip;
      parent = parent.GetParent();
    }
    return result;
  }
  
  GetLocalMatrix() {
    var result = new Prime.Mat44();

    var localMatrixNoPos = new Prime.Mat44();

    if(this.angle.z != 0) {
      localMatrixNoPos.Rotate(this.angle.z, 0, 0, 1);
    }
    
    var visualScaleX = this.hflip ? -this.scale.x : this.scale.x;
    var visualScaleY = this.vflip ? -this.scale.y : this.scale.y;
    var visualScaleZ = this.scale.z;
    
    if(visualScaleX != 1 || visualScaleY != 1 || visualScaleZ != 1) {
      localMatrixNoPos.Scale(visualScaleX, visualScaleY, visualScaleZ);
    }
    
    result.LoadTranslation(this.pos.x, this.pos.y, this.pos.z).Multiply(localMatrixNoPos);
    
    return result;
  }
  
  GetModelMatrix(toParent = null) {
    var parent = this.object.GetParent();
    var localMat = this.GetLocalMatrix();
    var result = localMat;
    
    while(parent && parent != toParent) {
      var parentMat = parent.transform.GetLocalMatrix();
      result = parentMat.Multiply(result);
      parent = parent.GetParent();
    }
    
    return result;
  }
  
  TransformPoint(x = 0, y = 0, z = 0) {
    var modelMat = this.GetModelMatrix();
    return modelMat.MultiplyPos3(x, y, z);
  }

  UpdateNode() {
    $(this.node).css('left', this.pos.x);
    $(this.node).css('top', this.pos.y);
    var scaleX = this.hflip ? -this.scale.x : this.scale.x;
    var scaleY = this.vflip ? -this.scale.y : this.scale.y;
    $(this.node).css('transform', 'rotate(' + this.angle.z + 'deg) scale(' + scaleX + ', ' + scaleY + ')');
    $(this.node).css('z-index', this.zIndex);
    
    this.object.OnTransformNodeUpdated();
  }
};

Prime.ODChildren = class {
  constructor(object) {
    this.object = object;
    this.objects = [];
  }
  
  Calc(dt) {
    this.OnCalc(dt);
  }
  
  OnCalc(dt) {
    for(var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      object.Calc(dt);
    }
  }
  
  Add(object) {
    object.info.parent = this.object;
    this.objects.push(object);
    this.object.transform.node.append(object.transform.node);
    object.OnAddedToParent(object);
    this.object.transform.UpdateNode();
  }
  
  Remove(object) {
    object.OnRemovedFromParent(this.object);
    object.parent = null;
    object.info.parent = null;
    Prime.RemoveFromArray(this.objects, object);
    this.object.transform.UpdateNode();
  }
  
  RemoveFromNodes() {
    this.object.transform.node.remove();
    
    for(var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      object.children.RemoveFromNodes(name);
    }
  }
  
  Get(name, recurse = true) {
    for(var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      if(object.info.IsName(name)) {
        return object;
      }
    }

    if(recurse) {
      for(var i = 0; i < this.objects.length; i++) {
        var object = this.objects[i];
        var child = object.children.Get(name);
        if(child) {
          return child;
        }
      }
    }
    
    return null;
  }
  
  WaitGet(name, callback, recurse = true) {
    var result = this.Get(name, recurse);
    if(result) {
      if(result instanceof Prime.ContentInstance) {
        var self = this;
        result.WaitForContent(function(contentInstance) {
          callback(self.object, contentInstance);
        });
      }
      else {
        callback(this.object, result);
      }
      return;
    }
    
    var self = this;
    var waitForChild = function() {
      var result = self.Get(name, recurse);
      if(result) {
        if(result instanceof Prime.ContentInstance) {
          result.WaitForContent(function(contentInstance) {
            callback(self.object, contentInstance);
          });
        }
        else {
          callback(self.object, result);
        }
      }
      else {
        setTimeout(waitForChild, Prime.RetryTimeoutCommon);
      }
    };
    waitForChild();
  }
  
  DestroyAll() {
    for(var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      object.Destroy();
    }
  }

  DestroyAllRec() {
    for(var i = 0; i < this.objects.length; i++) {
      var object = this.objects[i];
      object.children.DestroyAllRec();
      object.Destroy();
    }
  }
};

Prime.ODVisibility = class {
  constructor(object) {
    this.object = object;
  }
  
  Show() {
    $(this.object.transform.node).show();
  }
  
  Hide() {
    $(this.object.transform.node).hide();
  }
  
  SetShowing(showing) {
    if(showing)
      this.Show();
    else
      this.Hide();
  }
  
  IsShowing() {
    return $(this.object.transform.node).is(':visible');
  }
}

Prime.Content = class extends Prime.Object {
  
};

Prime.ContentInstance = class extends Prime.Object {
  constructor() {
    super();
    
    this.content = null;
    this.contentReady = false;
  }
  
  HasContent() {
    return this.content != null;
  }
  
  GetContent() {
    return this.content;
  }
  
  GetContentPath() {
    return this.content ? this.content.path : null;
  }
  
  IsContentPath(path) {
    return this.HasContent() ? (this.content.path == path) : false;
  }
  
  IsContentReady() {
    if(!this.contentReady)
      return false;

    for(var i = 0; i < this.children.objects.length; i++) {
      var child = this.children.objects[i];
      if(child.IsContentReady) {
        if(!child.IsContentReady()) {
          return false;
        }
      }
    }
    
    return true;
  }
  
  WaitForContent(callback) {
    if(this.IsContentReady()) {
      callback(this);
    }
    else {
      var self = this;
      var waitForContent = function() {
        if(self.IsContentReady()) {
          callback(self);
        }
        else {
          setTimeout(waitForContent, Prime.RetryTimeoutCommon);
        }
      };
      waitForContent();
    }
  }
 
  SetContent(path, readyCallback = null) {
    if(path) {
      this.contentReady = false;
      var self = this;
      Prime.GetContent(path, function(content) {
        self.OnWillChangeContent();
        self.content = content;

        self.OnChangedContent();
        
        if(self.isContentReadyCallback) {
          var waitForReady = function() {
            if(typeof self.isContentReadyCallback == 'function') {
              if(self.isContentReadyCallback()) {
                if(readyCallback) {
                  readyCallback(self);
                }
              }
              else {
                setTimeout(waitForReady, Prime.RetryTimeoutCommon);
              }
            }
            else {
              if(readyCallback) {
                readyCallback(self);
              }
            }
          };
          waitForReady();
        }
        else {
          if(readyCallback) {
            readyCallback(self);
          }
        }
        
        self.contentReady = true;
      });
    }
    else {
      this.OnWillChangeContent();
      this.contentReady = false;
      this.content = null;
      this.OnChangedContent();
      this.contentReady = true;
    }

    this.isContentReadyCallback = null;
  }
  
  SetIsContentReadyCallback(callback) {
    this.isContentReadyCallback = callback;
  }
  
  OnWillChangeContent() {
    
  }
  
  OnChangedContent() {
    
  }
};

Prime.RetryTimeoutCommon = 200;
Prime.SKELETON_FPS = 60;
Prime.ContentPath = '';
Prime.ContentData = {};
Prime.DestroyedObjects = [];
Prime.ObjectsByName = {};
Prime.ScreenW = 1200;
Prime.ScreenH = 675;
Prime.AjaxErrorRetryTimeMS = 1000;
Prime.DebugSimulateAjaxErrorPrefix = '_PrimeDebugSimulateAjaxError';

Prime.GetObject = function(name) {
  return Prime.ObjectsByName[name];
}

Prime.AddDestroyedObject = function(object) {
  if(!Prime.DestroyedObjects.find(function(element) {return element == object;})) {
    Prime.DestroyedObjects.push(object);  
  }
}

Prime.ProcessObjectDestroy = function() {
  for(var i = 0; i < Prime.DestroyedObjects.length; i++) {
    var object = Prime.DestroyedObjects[i];
    var parent = object.GetParent();
    if(parent) {
      parent.children.Remove(object);
      object.children.RemoveFromNodes();
    }
  }
}

Prime.ReadJSONFile = function(path, callback) {
  Prime.Assert(path, 'Null path.');
  var fullPath = Prime.ContentPath + path;
  var performAjax = function(url, callback) {
    var useURL = url;
    if(Prime.DebugSimulateAjaxError != undefined) {
      if(Math.random() < Prime.DebugSimulateAjaxError) {
        useURL = Prime.DebugSimulateAjaxErrorPrefix + useURL;
      }
    }

    jQuery.ajax({
      url: useURL,
      dataType: 'text',
      success: function(data) {
        var json;
        try {
          json = JSON.parse(data);
        }
        catch(e) {
          Prime.Assert(false, 'Problem parsing JSON at path: ' + path + ', exception: ' + e);
          json = '';
        }
        callback(path, json);
      },
      error: function(xhr, status, err) {
        Prime.DPrint('Problem downloading JSON file: ' + path + ', retrying...');
        setTimeout(function() {performAjax(url, callback);}, Prime.AjaxErrorRetryTimeMS);
      },
    });
  };
  performAjax(Prime.ContentPath + path + GVGet, callback);
};

Prime.DecodeUnicodeTextDecoder = new TextDecoder('utf-8');

Prime.DecodeUnicode = function(s) {
  var bytes = [];
  for(var i = 0; i < s.length; i++) {
    var c = s[i];
    if(c == '\\') {
      var p = s[++i];
      if(p == 'x') {
        var hexCode = s[++i];
        hexCode += s[++i];
        bytes.push(parseInt(hexCode, 16));
      }
      else {
        bytes.push(c.charCodeAt(0));
        bytes.push(p.charCodeAt(0));
      }
    }
    else {
      bytes.push(c.charCodeAt(0));
    }
  }
  
  return Prime.DecodeUnicodeTextDecoder.decode(new Uint8Array(bytes));
}

Prime.RemoveFromArray = function(a, v) {
  for(var i = 0; i < a.length; i++) {
    if(a[i] == v) {
      a.splice(i, 1);
      return;
    }
  }
};

Prime.ClearDictionary = function(d) {
  for(var key in d) {
    if(d.hasOwnProperty(key)) {
      delete d[key];
    }
  }
}

Prime.Vec3 = class {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  
  Add(other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;

    return this;
  }
  
  Subtract(other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    
    return this;
  }
  
  GetLength() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  
  Normalize() {
    var len = this.GetLength();
    if(len == 0)
      return this;
    var lenInv = 1 / len;
    this.x *= lenInv;
    this.y *= lenInv;
    this.z *= lenInv;
    return this;
  }
  
  IsNotOne() {
    return this.x != 1 || this.y != 1 || this.z != 1;
  }
  
  GetDirTo(posDir) {
    return (new Prime.Vec3(posDir.x, posDir.y)).Subtract(this).Normalize();
  }
};

Prime.Mat44 = class {
  constructor() {
    // eRC -- value row, col -- e32 = row 3, col 2
    this.e11 = 1;
    this.e21 = 0;
    this.e31 = 0;
    this.e41 = 0;
    this.e12 = 0;
    this.e22 = 1;
    this.e32 = 0;
    this.e42 = 0;
    this.e13 = 0;
    this.e23 = 0;
    this.e33 = 1;
    this.e43 = 0;
    this.e14 = 0;
    this.e24 = 0;
    this.e34 = 0;
    this.e44 = 1;
  }
  
  IsIdentity() {
    return this.e11 == 1 &&
      this.e21 == 0 &&
      this.e31 == 0 &&
      this.e41 == 0 &&
      this.e12 == 0 &&
      this.e22 == 1 &&
      this.e32 == 0 &&
      this.e42 == 0 &&
      this.e13 == 0 &&
      this.e23 == 0 &&
      this.e33 == 1 &&
      this.e43 == 0 &&
      this.e14 == 0 &&
      this.e24 == 0 &&
      this.e34 == 0 &&
      this.e44 == 1;
  }
  
  Copy(other) {
    this.e11 = other.e11;
    this.e21 = other.e21;
    this.e31 = other.e31;
    this.e41 = other.e41;
    this.e12 = other.e12;
    this.e22 = other.e22;
    this.e32 = other.e32;
    this.e42 = other.e42;
    this.e13 = other.e13;
    this.e23 = other.e23;
    this.e33 = other.e33;
    this.e43 = other.e43;
    this.e14 = other.e14;
    this.e24 = other.e24;
    this.e34 = other.e34;
    this.e44 = other.e44;

    return this;
  }
  
  LoadTranslation(x, y, z) {
    this.e11 = 1;
    this.e21 = 0;
    this.e31 = 0;
    this.e41 = 0;
    this.e12 = 0;
    this.e22 = 1;
    this.e32 = 0;
    this.e42 = 0;
    this.e13 = 0;
    this.e23 = 0;
    this.e33 = 1;
    this.e43 = 0;
    this.e14 = x;
    this.e24 = y;
    this.e34 = z;
    this.e44 = 1;
    
    return this;
  }
  
  LoadScaling(x, y, z) {
    this.e11 = x;
    this.e21 = 0;
    this.e31 = 0;
    this.e41 = 0;
    this.e12 = 0;
    this.e22 = y;
    this.e32 = 0;
    this.e42 = 0;
    this.e13 = 0;
    this.e23 = 0;
    this.e33 = z;
    this.e43 = 0;
    this.e14 = 0;
    this.e24 = 0;
    this.e34 = 0;
    this.e44 = 1;
    
    return this;
  }
  
  LoadRotation(angle, x, y, z) {
    var angleRad = angle * Prime.PiBy180;
    var c = Math.cos(angleRad);
    var s = Math.sin(angleRad);
    var omc = 1 - c;
    var xx = x * x;
    var yy = y * y;
    var zz = z * z;
    var xy = x * y;
    var xz = x * z;
    var yz = y * z;
    var xs = x * s;
    var ys = y * s;
    var zs = z * s;

    this.e11 = xx * omc + c;
    this.e21 = xy * omc + zs;
    this.e31 = xz * omc - ys;
    this.e41 = 0;

    this.e12 = xy * omc - zs;
    this.e22 = yy * omc + c;
    this.e32 = yz * omc + xs;
    this.e42 = 0;

    this.e13 = xz * omc + ys;
    this.e23 = yz * omc - xs;
    this.e33 = zz * omc + c;
    this.e43 = 0;

    this.e14 = 0;
    this.e24 = 0;
    this.e34 = 0;
    this.e44 = 1;
    
    return this;
  }
  
  Multiply(by) {
    if(by.IsIdentity())
      return this;
    
    if(this.IsIdentity()) {
      this.Copy(by);
      return this;
    }
    
    var e11 = this.e11;
    var e21 = this.e21;
    var e31 = this.e31;
    var e41 = this.e41;
    var e12 = this.e12;
    var e22 = this.e22;
    var e32 = this.e32;
    var e42 = this.e42;
    var e13 = this.e13;
    var e23 = this.e23;
    var e33 = this.e33;
    var e43 = this.e43;
    var e14 = this.e14;
    var e24 = this.e24;
    var e34 = this.e34;
    var e44 = this.e44;
    
    this.e11 = e11 * by.e11 + e12 * by.e21 + e13 * by.e31 + e14 * by.e41;
    this.e12 = e11 * by.e12 + e12 * by.e22 + e13 * by.e32 + e14 * by.e42;
    this.e13 = e11 * by.e13 + e12 * by.e23 + e13 * by.e33 + e14 * by.e43;
    this.e14 = e11 * by.e14 + e12 * by.e24 + e13 * by.e34 + e14 * by.e44;
    
    this.e21 = e21 * by.e11 + e22 * by.e21 + e23 * by.e31 + e24 * by.e41;
    this.e22 = e21 * by.e12 + e22 * by.e22 + e23 * by.e32 + e24 * by.e42;
    this.e23 = e21 * by.e13 + e22 * by.e23 + e23 * by.e33 + e24 * by.e43;
    this.e24 = e21 * by.e14 + e22 * by.e24 + e23 * by.e34 + e24 * by.e44;

    this.e31 = e31 * by.e11 + e32 * by.e21 + e33 * by.e31 + e34 * by.e41;
    this.e32 = e31 * by.e12 + e32 * by.e22 + e33 * by.e32 + e34 * by.e42;
    this.e33 = e31 * by.e13 + e32 * by.e23 + e33 * by.e33 + e34 * by.e43;
    this.e34 = e31 * by.e14 + e32 * by.e24 + e33 * by.e34 + e34 * by.e44;

    if(by.e41 == 0 && by.e42 == 0 && by.e43 == 0 && by.e44 == 1) {
      this.e41 = by.e41;
      this.e42 = by.e42;
      this.e43 = by.e43;
      this.e44 = by.e44;
    }
    else {
      this.e41 = e41 * by.e11 + e42 * by.e21 + e43 * by.e31 + e44 * by.e41;
      this.e42 = e41 * by.e12 + e42 * by.e22 + e43 * by.e32 + e44 * by.e42;
      this.e43 = e41 * by.e13 + e42 * by.e23 + e43 * by.e33 + e44 * by.e43;
      this.e44 = e41 * by.e14 + e42 * by.e24 + e43 * by.e34 + e44 * by.e44;
    }

    return this;
  }
  
  Translate(x, y, z) {
    return this.Multiply((new Prime.Mat44()).LoadTranslation(x, y, z));
  }
  
  Scale(x, y, z) {
    return this.Multiply((new Prime.Mat44()).LoadScaling(x, y, z));
  }
  
  Rotate(angle, x, y, z) {
    return this.Multiply((new Prime.Mat44()).LoadRotation(angle, x, y, z));
  }
  
  MultiplyPos2(x, y, w = 1) {
    return new Prime.Vec3(
      this.e11 * x + this.e12 * y + this.e14 * w,
      this.e21 * x + this.e22 * y + this.e24 * w,
      this.e31 * x + this.e32 * y + this.e34 * w);
  }
  
  MultiplyPos3(x, y, z, w = 1) {
    return new Prime.Vec3(
      this.e11 * x + this.e12 * y + this.e13 * z + this.e14 * w,
      this.e21 * x + this.e22 * y + this.e23 * z + this.e24 * w,
      this.e31 * x + this.e32 * y + this.e33 * z + this.e34 * w);
  }
};

Prime.Math = class {
  IntDiv(n, d) {
    return Math.floor(Math.floor(n) / Math.floor(d))
  }

  GetLerp(a, b, t) {
    if(t == 0)
      return a;
    else if(t == 1)
      return b;
    else
      return a + (b - a) * t;
  }
  
  GetCosFFD(angle) {
    return Math.cos(angle * Prime.PiBy180);
  }

  GetSinFFD(angle) {
    return Math.sin(angle * Prime.PiBy180);
  }
}

Prime.Random = class {
  constructor() {
    this.mt = new MersenneTwister();
  }
  
  Seed(seed) {
    this.mt.init_seed(seed);
  }
  
  GetValue() {
    return this.mt.random_int();
  }
  
  GetValueMax() {
    return 0xFFFFFFFF;
  }
  
  GetRangeInt(low, high) {
    if(low == high) {
      return low;
    }

    var v = this.GetValue();
    var range = high - low + 1;
    return low + (v % range);
  }
  
  GetRangeFloat(low, high) {
    if(low == high) {
      return low;
    }

    var v = this.GetValue();
    var range = Number(high - low);
    return low + (v % range);
  }
}

Prime.GetContent = function(path, callback) {
  var origPath = path;
  const pcdSuffix = '.pcd';
  if(path.endsWith(pcdSuffix)) {
    path = path.substr(0, path.length - pcdSuffix.length) + '.json';
  }
  if(Prime.ContentData[path]) {
    callback(Prime.ContentData[path]);
  }
  else {
    var status = Prime.ContentData[path];
    if(status == 0) {
      var waitOnData = function(path) {
        if(Prime.ContentData[path]) {
          callback(Prime.ContentData[path]);
          return;
        }
        else {
          setTimeout(function() {waitOnData(path);}, Prime.RetryTimeoutCommon);
        }
      };
      waitOnData(path);
    }
    else {
      Prime.ContentData[path] = 0;
      Prime.ReadJSONFile(path, function(path, content) {
        content.path = path;

        if(content._className == 'Script') {
          if(content.jsClass == 0) {
            var waitOnScriptJSClass = function(content) {
              if(content.jsClass) {
                callback(content);
              }
              else {
                setTimeout(function() {waitOnScriptJSClass(content);}, Prime.RetryTimeoutCommon);
              }
            };
            waitOnScriptJSClass(content);
          }
          else {
            content.jsClass = 0;
            var performAjax = function(url, callback) {
              var useURL = url;
              if(Prime.DebugSimulateAjaxError != undefined) {
                if(Math.random() < Prime.DebugSimulateAjaxError) {
                  useURL = Prime.DebugSimulateAjaxErrorPrefix + useURL;
                }
              }
              
              jQuery.ajax({
                url: useURL,
                dataType: 'text',
                success: function(data) {
                  var srcInclude = null;
                  var useData = data;
                  var includePrefix = '//#include';
                  if(useData.startsWith(includePrefix)) {
                    var includeEndIndex = useData.indexOf('\n');
                    Prime.Assert(includeEndIndex != -1, 'Problem parsing script include: path = ' + path);
                    srcInclude = data.substr(includePrefix.length, includeEndIndex - includePrefix.length).trim();
                    srcInclude = srcInclude.substr(1, srcInclude.length - 2);
                    useData = data.substr(includeEndIndex + 1);
                  }

                  var evalCode = function() {
                    var jsClassName = useData.split(' ')[1];
                    try {
                      jQuery.globalEval(useData);
                    }
                    catch(e) {
                      Prime.Assert(false, 'Problem executing script: path = ' + path + ', exception: ' + e);
                      throw e;
                    }
                    try {
                      eval('content.jsClass = ' + jsClassName);
                    }
                    catch(e) {
                      Prime.Assert(false, 'Problem setting up script: path = ' + path + ', exception: ' + e);
                      throw e;
                    }
                    Prime.ContentData[path] = content;
                    callback(content);
                  };

                  if(srcInclude) {
                    Prime.GetContent(srcInclude, function(includeScript) {
                      evalCode();
                    });
                  }
                  else {
                    evalCode();                  
                  }                
                },
                error: function(xhr, status, err) {
                  Prime.DPrint('Problem downloading script file: ' + path + ', retrying...');
                  setTimeout(function() {performAjax(url, callback);}, Prime.AjaxErrorRetryTimeMS);
                },
              });
            };
            performAjax(Prime.ContentPath + content.file + GVGet, callback);
          }
        }
        else {
          Prime.ContentData[path] = content;
          callback(content);
        }
      });
    }
  }
};

Prime.Script = class extends Prime.ContentInstance {
  OnCalc(dt) {
    if(this.js && this.js.OnCalc) {
      this.js.OnCalc(dt);
    }
  }
  
  OnChangedContent() {
    super.OnChangedContent();

    if(this.HasContent()) {
      if(this.content.jsClass) {
        this.js = new this.content.jsClass(this);
        if(this.js.OnInit) {
          this.js.OnInit();
        }
      }
    }
    else {
      this.js = null;
    }
  }
};

Prime.ActionObject = class extends Prime.ContentInstance {
  constructor() {
    super();
    
    this.scriptListeners = [];
  }

  AddScriptListener(script, suffix = null) {
    this.scriptListeners.push({
      script: script,
      suffix: suffix,
    });
  }
  
  RemoveScriptListener(script) {
    var go = true;
    while(go) {
      go = false;
      for(var i = 0; i < this.scriptListeners.length; i++) {
        var scriptListener = this.scriptListeners[i];
        if(scriptListener.script == script) {
          Prime.RemoveFromArray(this.scriptListeners, scriptListener);
          go = true;
          break;
        }
      }
    }
  }

  SendActionDoneEvent(name) {
    const functionName = 'OnActionDone';
    for(var i = 0; i < this.scriptListeners.length; i++) {
      var scriptListener = this.scriptListeners[i];
      var callFunctionName = scriptListener.suffix ? (functionName + scriptListener.suffix) : functionName;
      if(scriptListener.script.js[callFunctionName]) {
        scriptListener.script.js[callFunctionName](this, name);
      }
    }
  }

  SendEnterActionEvent(name) {
    const functionName = 'OnEnterAction';
    for(var i = 0; i < this.scriptListeners.length; i++) {
      var scriptListener = this.scriptListeners[i];
      var callFunctionName = scriptListener.suffix ? (functionName + scriptListener.suffix) : functionName;
      if(scriptListener.script.js[callFunctionName]) {
        scriptListener.script.js[callFunctionName](this, name);
      }
    }
  }

  SendExitActionEvent(name) {
    const functionName = 'OnExitAction';
    for(var i = 0; i < this.scriptListeners.length; i++) {
      var scriptListener = this.scriptListeners[i];
      var callFunctionName = scriptListener.suffix ? (functionName + scriptListener.suffix) : functionName;
      if(scriptListener.script.js[callFunctionName]) {
        scriptListener.script.js[callFunctionName](this, name);
      }
    }
  }

  SendBeginActionEvent(name, loopCount) {
    const functionName = 'OnBeginAction';
    for(var i = 0; i < this.scriptListeners.length; i++) {
      var scriptListener = this.scriptListeners[i];
      var callFunctionName = scriptListener.suffix ? (functionName + scriptListener.suffix) : functionName;
      if(scriptListener.script.js[callFunctionName]) {
        scriptListener.script.js[callFunctionName](this, name, loopCount);
      }
    }
  }

  SendEndActionEvent(name, loopCount) {
    const functionName = 'OnEndAction';
    for(var i = 0; i < this.scriptListeners.length; i++) {
      var scriptListener = this.scriptListeners[i];
      var callFunctionName = scriptListener.suffix ? (functionName + scriptListener.suffix) : functionName;
      if(scriptListener.script.js[callFunctionName]) {
        scriptListener.script.js[callFunctionName](this, name, loopCount);
      }
    }
  }

  SendCalcActionEvent(name, dt) {
    const functionName = 'OnCalcAction';
    for(var i = 0; i < this.scriptListeners.length; i++) {
      var scriptListener = this.scriptListeners[i];
      var callFunctionName = scriptListener.suffix ? (functionName + scriptListener.suffix) : functionName;
      if(scriptListener.script.js[callFunctionName]) {
        scriptListener.script.js[callFunctionName](this, name, dt);
      }
    }
  }
};

Prime.Imagemap = class extends Prime.ContentInstance {
  OnChangedContent() {
    super.OnChangedContent();

    this.UpdateNode();
  }
  
  SetRect(name) {
    this.rectName = name;

    this.UpdateNode();
  }
  
  UpdateNode() {
    if(!this.HasContent() && !this.IsContentReady())
      return;

    if(this.rectContainer) {
      this.rectContainer.remove();
      this.rectContainer = null;
    }
    
    var content = this.content;
    
    var useRectName = this.rectName;
    if(useRectName == undefined)
      useRectName = '';
    
    var rect = content.rects[content.rectsLookupIndex[useRectName]];
    if(!rect)
      return;
    
    var texRect = content.texRects[content.texRectsLookupIndex[useRectName]];
    if(!texRect)
      return;

    this.rectContainer = document.createElement('div');
    var img = document.createElement('img');
    this.transform.node.append(this.rectContainer);
    this.rectContainer.append(img);

    var origin = rect.points[rect.pointsLookupIndex['origin']];

    $(this.rectContainer).attr('style', 'overflow: hidden; position: absolute; width: ' + rect.dw + 'px; height: ' + rect.dh + 'px; transform: translate(' + (rect.sx - origin.x) + 'px, ' + (rect.sy - origin.y) + 'px) scale(1, -1);');

    var container, scaler, img;
    if(content.dataRatioN != content.dataRatioD) {
      scaler = document.createElement('div');
      img.remove();
      this.rectContainer.append(scaler);
      scaler.append(img);
      var dataRatioInv = content.dataRatioD / content.dataRatioN;
      $(scaler).attr('style', 'position: absolute; transform: scale(' + dataRatioInv + ');');
    }

    $(img).attr('style', 'position: absolute; transform: translate(' + (-texRect.x) + 'px, ' + (-texRect.y) + 'px);');
    
    $(img).attr('src', Prime.ContentPath + content.imgPath + GVGet);
  }
};

Prime.Skinset = class extends Prime.ContentInstance {
  constructor() {
    super();
    
    this.pieces = null;
    this.loadedImagesTotal = 0;
    this.loadedImagesCount = 0;
  }

  OnChangedContent() {
    if(this.HasContent()) {
      var content = this.GetContent();

      var self = this;
      var pieces = [];
      var pieceCreatedCount = 0;

      this.SetIsContentReadyCallback(function() {
        return pieceCreatedCount == content.pieces.length;
      });

      this.loadedPartsTotal = 0;
      this.loadedPartsCount = 0;

      for(var i = 0; i < content.pieces.length; i++) {
        (function(i) {
          var pieceContentData = content.pieces[i];
          Prime.GetContent(pieceContentData.content, function(pieceContent) {
            var node = document.createElement('div');
            
            if(pieceContent._className == 'Imagemap') {
              self.loadedPartsTotal++;
            }
            else if(pieceContent._className == 'Skeleton') {
              self.loadedPartsTotal++;
            }
          });
        })(i);
      }

      for(var i = 0; i < content.pieces.length; i++) {
        (function(i) {
          var pieceContentData = content.pieces[i];
          Prime.GetContent(pieceContentData.content, function(pieceContent) {
            var node = document.createElement('div');

            var piece =  {
              node: node,
              content: pieceContent,
              pieceContent: pieceContentData,
            };

            pieces[i] = piece;

            if(pieceContent._className == 'Imagemap') {
              var dataRatioN = pieceContent.dataRatioN;
              var dataRatioD = pieceContent.dataRatioD;

              var rect = pieceContent.rects[pieceContent.rectsLookupIndex[pieceContentData.action]];
              var texRect = pieceContent.texRects[pieceContent.texRectsLookupIndex[pieceContentData.action]];
              var origin = rect.points[rect.pointsLookupIndex['origin']];

              var container, scaler, img;
              if(dataRatioN == dataRatioD) {
                container = document.createElement('div');
                img = document.createElement('img');
                node.append(container);
                container.append(img);
              }
              else {
                container = document.createElement('div');
                scaler = document.createElement('div');
                img = document.createElement('img');
                node.append(container);
                container.append(scaler);
                scaler.append(img);
              }

              var dataRatioInv = dataRatioD / dataRatioN;

              $(node).attr('style', 'transform: rotate(' + (piece.pieceContent.baseAngle) + 'deg) scale(' + piece.pieceContent.baseScaleX + ', ' + piece.pieceContent.baseScaleY + ');');
              $(container).attr('style', 'overflow: hidden; position: absolute; width: ' + rect.dw + 'px; height: ' + rect.dh + 'px; transform: translate(' + (rect.sx - origin.x) + 'px, ' + (rect.sy - origin.y) + 'px)');

              if(scaler) {
                var dataRatioInv = dataRatioD / dataRatioN;
                $(scaler).attr('style', 'position: absolute; transform: scale(' + dataRatioInv + ');');
              }

              $(img).attr('id', piece.content.name);
              $(img).attr('style', 'position: absolute; transform: translate(' + (-texRect.x) + 'px, ' + (-texRect.y) + 'px);');

              $(img).on('load', function() {
                self.loadedPartsCount++;
              });

              $(img).on('error', function() {
                self.loadedPartsCount++;
              });

              $(img).attr('src', Prime.ContentPath + pieceContent.imgPath + GVGet);
            }
            else if(pieceContent._className == 'Skeleton') {
              var skeleton = self.Create(Prime.Skeleton);
              skeleton.SetContent(pieceContentData.content);
              skeleton.SetSkinset(pieceContentData.skin);
              node.append(skeleton.transform.node);
              piece.contentInstance = skeleton;

              $(node).attr('style', 'transform: rotate(' + (piece.pieceContent.baseAngle) + 'deg) scale(' + piece.pieceContent.baseScaleX + ', ' + (-piece.pieceContent.baseScaleY) + ');');
              
              skeleton.WaitForAllPartsLoaded(function(skeleton) {
                self.loadedPartsCount++;
              });
            }
            else {
              throw('Unsupported content type "' + piece.content._className + '" for piece "' + pieceContentData.name + '" in skinset: "' + path + '"');
            }

            pieceCreatedCount++;
            if(pieceCreatedCount == content.pieces.length) {
              self.pieces = pieces;
            }
          });
        })(i);
      }
    }
  }

  AreAllPartsLoaded() {
    return this.loadedPartsCount >= this.loadedPartsTotal;
  }
  
  WaitForAllPartsLoaded(callback) {
    var self = this;
    var waitForAllPartsLoaded = function() {
      if(self.AreAllPartsLoaded()) {
        callback(self);
      }
      else {
        setTimeout(waitForAllPartsLoaded, Prime.RetryTimeoutCommon);
      }
    };
    waitForAllPartsLoaded();    
  }
};

Prime.Skeleton = class Skeleton extends Prime.ActionObject {
  constructor() {
    super();
    
    this.skinset = null;
    
    this.additionalSkinsets = null;
    this.additionalSkinsetActiveBones = null;
    
    this.cachedAffixPoses = {};
    
    this.randomActionCtr = Math.random() * 2 + 3;
    this.randomActionEnabled = false;
  }
  
  GetActionName() {
    return this.action.name;
  }
  
  GetActionLen() {
    return this.actionLen;
  }

  GetActionTime() {
    return this.actionCtr;
  }

  GetActionT() {
    return this.actionLen > 0 ? (this.actionCtr / this.actionLen) : 0;
  }
  
  OnCalc(dt) {
    super.OnCalc(dt);

    if(this.skinset) {
      this.skinset.Calc(dt);
    }
    
    if(this.randomActionEnabled) {
      this.randomActionCtr = this.randomActionCtr - dt;
      if(this.randomActionCtr <= 0) {
        this.randomActionCtr = Math.random() * 2 + 3;
        if(this.content) {
          this.SetActionContent(this.content.actions[Math.floor(Math.random() * this.content.actions.length)]);
        }
      }
    }
    
    if(this.action) {
      this.actionCtr += dt;
    
      if(this.actionLen > 0) {
        while(this.actionCtr >= this.actionLen) {
          if(!this.action.loop && this.action.nextAction) {
            this.SetAction(this.action.nextAction);
            break;
          }
          
          if(this.action.loop) {
            this.SendEndActionEvent(this.action.name, this.actionLoopCount);
          }
        
          if(this.actionCtr >= this.actionLen) {
            if(this.action.loop) {
              this.actionCtr -= this.actionLen;
              this.actionLoopCount++;
            }
            else {
              this.actionCtr = this.actionLen;
            }
          }

          if(this.action.loop) {
            this.SendBeginActionEvent(this.action.name, this.actionLoopCount);
          }
        
          if(this.actionCtr >= this.actionLen && !this.action.loop) {
            break;
          }
        }
      }
      
      this.CacheBoneTransforms();
    }

    this.PerformBoneDepthSort();
    
    if(this.action) {
      this.SendCalcActionEvent(this.GetActionName(), dt);
    }
  }

  OnChangedContent() {
    if(this.ps) {
      this.ps.Destroy();
      this.ps = null;      
    }

    if(this.HasContent()) {
      if(this.content.actions.length > 0) {
        this.SetActionContent(this.content.actions[0]);
      }
    }
  }
 
  SetSkinset(path, readyCallback = null) {
    var self = this;  
    var skinset = this.Create(Prime.Skinset);
    skinset.SetContent(path, function(skinset) {
      self.skinset = skinset;
      self.UpdateSkinsetNode();
      if(readyCallback) {
        readyCallback(self, skinset);
      }
    });
  }
  
  GetSkinset() {
    return this.skinset;
  }
  
  HasSkinset() {
    return this.skinset != null;
  }

  WaitForSkinset(callback) {
    if(this.skinset && this.skinset.IsContentReady()) {
      callback(this);
    }
    else {
      var self = this;
      var waitForSkinset = function() {
        if(self.skinset && self.skinset.IsContentReady()) {
          callback(self, self.skinset);
        }
        else {
          setTimeout(waitForSkinset, Prime.RetryTimeoutCommon);
        }
      };
      waitForSkinset();
    }
  }
  
  AddAdditionalSkinset(path, activeBones, readyCallback = null) {
    Prime.Assert(this.content && this.IsContentReady(), 'Skeleton has no content or is not ready.');
    
    if(!this.HasSkinset()) {
      this.SetSkinset(path);
    }
    else {
      if(!this.additionalSkinsets) {
        this.additionalSkinsets = [];
      }
      
      var boneCount = this.content.bones.length;
      
      if(!this.additionalSkinsetActiveBones) {
        this.additionalSkinsetActiveBones = [];
        for(var i = 0; i < boneCount; i++) {
          this.additionalSkinsetActiveBones.push(0);
        }
      }
      
      if(this.additionalSkinsets && this.additionalSkinsetActiveBones) {
        var self = this;  
        var skinset = this.Create(Prime.Skinset);
        skinset.SetContent(path, function(skinset) {
          self.additionalSkinsets.push(skinset);
          var skinsetIndex = self.additionalSkinsets.length;
          
          for(var i = 0; i < activeBones.length; i++) {
            var activeBone = activeBones[i];
            var boneIndex = self.content.bonesLookupIndex[activeBone];
            if(boneIndex != undefined) {
              self.additionalSkinsetActiveBones[boneIndex] = skinsetIndex;
            }
          }
          
          self.UpdateSkinsetNode();
          
          if(readyCallback)
            readyCallback(self);
        });
      }
    }
  }
  
  HasAdditionalSkinsets() {
    return this.additionalSkinsets != null && this.additionalSkinsetActiveBones != null;
  }
  
  GetSkinsetForBone(boneIndex) {
    if(this.HasAdditionalSkinsets()) {
      var skinsetIndex = this.additionalSkinsetActiveBones[boneIndex];
      if(skinsetIndex > 0) {
        var additionalSkinset = this.additionalSkinsets[skinsetIndex - 1];
        return additionalSkinset;
      }
    }
    
    return this.GetSkinset();
  }
  
  UpdateSkinsetNode() {
    if(this.skinsetNode) {
      this.skinsetNode.remove();
      this.skinsetNode = null;
    }

    this.affixes = null;

    var self = this;
    this.WaitForContent(function(skeleton) {
      var boneCount = self.content.bones.length;

      var skinsetNode = document.createElement('div');
      $(skinsetNode).hide();
      $(skinsetNode).css('position', 'absolute');
      $(skinsetNode).attr('id', 'SkinsetNode');
      self.transform.node.append(skinsetNode);

      var affixRootNode = document.createElement('div');
      $(affixRootNode).attr('id', 'AffixNodeRoot');
      $(affixRootNode).css('position', 'absolute');
      skinsetNode.append(affixRootNode);

      var affixes = [];
      self.affixes = affixes;
      self.skinsetNode = skinsetNode;
      self.affixRootNode = affixRootNode;

      var loadedSkinsetTotal = 0;
      var loadedSkinsetCount = 0;

      for(var i = 0; i < boneCount; i++) {
        var skinset = self.GetSkinsetForBone(i);
        if(skinset && skinset.pieces) {
          loadedSkinsetTotal++;
        }
      }

      for(var i = 0; i < boneCount; i++) {
        var skinset = self.GetSkinsetForBone(i);
        if(skinset && skinset.pieces) {
          for(var j = 0; j < skinset.pieces.length; j++) {
            var piece = skinset.pieces[j];
            if(piece.pieceContent.affix == self.content.bones[i].name) {
              var affixNode = document.createElement('div');
              $(affixNode).attr('id', piece.pieceContent.name);
              $(affixNode).css('position', 'absolute');
              affixNode.append(piece.node);

              affixes.push({
                node: affixNode,
                piece: piece,
                boneIndex: i,
              });

              affixRootNode.append(affixNode);
            }
          }

          loadedSkinsetCount++;
          if(loadedSkinsetCount == loadedSkinsetTotal) {
            skinset.WaitForAllPartsLoaded(function(skinset) {
              self.CacheBoneTransforms();

              if(self.action) {
                $(skinsetNode).css('transform', 'translate(' + (-self.action.x) + 'px, ' + (-self.action.y) + 'px) scale(1, -1)');
              }

              $(skinsetNode).show();
            });
          }
        }
      }
    });
  }
    
  SetPoseByName(name1, name2 = null, weight = 0.0) {
    if(name2 == null) {
      var pose1 = this.content.poses[this.content.posesLookupIndex[name1]];
      this.SetPose(pose1, null, weight);
    }
    else {
      var pose1 = this.content.poses[this.content.posesLookupIndex[name1]];
      var pose2 = this.content.poses[this.content.posesLookupIndex[name2]];
      this.SetPose(pose1, pose2, weight);
    }
  }

  SetPose(pose1, pose2 = null, weight = 0.0) {
    if(!this.affixes)
      return;
    
    var affixes = this.affixes;
    
    if(pose2 == null) {
      for(var i = 0; i < affixes.length; i++) {
        var affix = affixes[i];
        var lookup = pose1.bonesLookupIndex[affix.piece.pieceContent.affix];
        if(lookup != undefined) {
          var poseBone = pose1.bones[lookup];
          if(poseBone) {
            var poseAngle = poseBone.transform.angle;
            var poseScaleX = poseBone.transform.scaleX;
            var poseScaleY = poseBone.transform.scaleY;
            var poseX = poseBone.transform.x;
            var poseY = poseBone.transform.y;

            this.cachedAffixPoses[i] = {
              angle: poseAngle,
              scaleX: poseScaleX,
              scaleY: poseScaleY,
              x: poseX,
              y: poseY,
            };

            $(affix.node).css('transform', 'translate(' + (poseX) + 'px, ' + (-poseY) + 'px) rotate(' + (-poseAngle) + 'deg) scale(' + (poseScaleX) + ', ' + (poseScaleY) + ')');
          }
        }
      }
    }
    else {
      var useWeight = weight;

      for(var i = 0; i < affixes.length; i++) {
        var affix = affixes[i];
        var lookup1 = pose1.bonesLookupIndex[affix.piece.pieceContent.affix];
        if(lookup1 != undefined) {
          var poseBone1 = pose1.bones[lookup1];
          if(poseBone1) {
            var lookup2 = pose2.bonesLookupIndex[affix.piece.pieceContent.affix];
            if(lookup2 != undefined) {
              var poseBone2 = pose2.bones[lookup2];
              if(poseBone2) {
                var poseAngle = poseBone1.transform.angle * (1.0 - useWeight) + poseBone2.transform.angle * useWeight;
                var poseScaleX = poseBone1.transform.scaleX * (1.0 - useWeight) + poseBone2.transform.scaleX * useWeight;
                var poseScaleY = poseBone1.transform.scaleY * (1.0 - useWeight) + poseBone2.transform.scaleY * useWeight;
                var poseX = poseBone1.transform.x * (1.0 - useWeight) + poseBone2.transform.x * useWeight;
                var poseY = poseBone1.transform.y * (1.0 - useWeight) + poseBone2.transform.y * useWeight;

                this.cachedAffixPoses[i] = {
                  angle: poseAngle,
                  scaleX: poseScaleX,
                  scaleY: poseScaleY,
                  x: poseX,
                  y: poseY,
                };

                $(affix.node).css('transform', 'translate(' + (poseX) + 'px, ' + (-poseY) + 'px) rotate(' + (-poseAngle) + 'deg) scale(' + (poseScaleX) + ', ' + (poseScaleY) + ')');
              }
            }
          }
        }
      }
    }
  }
  
  SetAction(name) {
    var action = this.content.actions[this.content.actionsLookupIndex[name]];
    if(action) {
      this.SetActionContent(action);
    }
  }

  SetActionContent(action) {
    var oldAction = this.action;
    var oldLoopCount = this.actionLoopCount;
    
    this.action = action
    this.actionCtr = 0;
    this.actionLoopCount = 0;
    
    this.actionLenInFrames = 0;
    for(var i = 0; i < action.keyFrames.length; i++) {
      var keyFrame = action.keyFrames[i];
      this.actionLenInFrames += keyFrame.len;
    }
    
    this.actionLen = this.actionLenInFrames / Prime.SKELETON_FPS;

    if(this.skinsetNode) {
      $(this.skinsetNode).css('transform', 'translate(' + (-this.action.x) + 'px, ' + (-this.action.y) + 'px) scale(1, -1)');
    }
    
    this.CacheBoneTransforms();

    if(oldAction) {
      this.SendEndActionEvent(oldAction.name, oldLoopCount);
      this.SendExitActionEvent(oldAction.name);
    }

    this.SendEnterActionEvent(this.action.name);
    this.SendBeginActionEvent(this.action.name, this.actionLoopCount);
  }
  
  GetPointPos(name, toParent = null) {
    if(!this.HasContent())
      return null;

    if(!this.HasSkinset())
      return null;

    if(!this.affixes)
      return null;
    
    for(var i = 0; i < this.affixes.length; i++) {
      var affix = this.affixes[i];
      
      var bone = this.content.bones[affix.boneIndex];

      var cachedAffixPose = this.cachedAffixPoses[i];

      if(cachedAffixPose) {
        var piece = affix.piece;
        var pieceContent = piece.content;
        var pieceContentData = piece.pieceContent;

        if(pieceContent._className == 'Imagemap') {
          var rect = pieceContent.rects[pieceContent.rectsLookupIndex[pieceContentData.action]];
          var texRect = pieceContent.texRects[pieceContent.texRectsLookupIndex[pieceContentData.action]];

          if(rect && texRect) {
            var pointLookup = rect.pointsLookupIndex[name];
            if(pointLookup != undefined) {
              var point = rect.points[pointLookup];
              var origin = rect.points[rect.pointsLookupIndex['origin']];

              var px = point.x - origin.x;
              var py = origin.y - point.y;

              var ux = px * cachedAffixPose.scaleX * pieceContentData.baseScaleX;
              var uy = py * cachedAffixPose.scaleY * pieceContentData.baseScaleY;

              var angleRad = (cachedAffixPose.angle - pieceContentData.baseAngle) * Prime.PiBy180;
              var ca = Math.cos(angleRad);
              var sa = Math.sin(angleRad);
              var nx = ca * ux - sa * uy;
              var ny = sa * ux + ca * uy;

              if(toParent == this) {
                return new Prime.Vec3(cachedAffixPose.x + nx, cachedAffixPose.y + ny);
              }
              else {
                var mat = this.transform.GetModelMatrix(toParent);
                return mat.MultiplyPos2(cachedAffixPose.x + nx, cachedAffixPose.y + ny);
              }
            }
          }
        }
        else if(pieceContent._className == 'Skeleton') {
          var result = piece.contentInstance.GetPointPos(name, this);
          if(result) {
            var px = result.x;
            var py = result.y;

            var ux = px * cachedAffixPose.scaleX;
            var uy = py * cachedAffixPose.scaleY;

            var angleRad = cachedAffixPose.angle * Prime.PiBy180;
            var ca = Math.cos(angleRad);
            var sa = Math.sin(angleRad);
            var nx = ca * ux - sa * uy;
            var ny = sa * ux + ca * uy;

            if(toParent == this) {
              return new Prime.Vec3(cachedAffixPose.x + nx, cachedAffixPose.y + ny);
            }
            else {
              var mat = this.transform.GetModelMatrix(toParent);
              return mat.MultiplyPos2(cachedAffixPose.x + nx, cachedAffixPose.y + ny);
            }
          }
        }
      }
    }
    
    return null;
  }
  
  CacheBoneTransforms() {
    if(!this.action)
      return;
    
    var actionFramePoses = this.GetActionFramePoses();
    var pose1 = actionFramePoses[0];
    var pose2 = actionFramePoses[1];
    var weight = actionFramePoses[2];
    
    this.SetPose(pose1, pose2, weight);

    this.PerformBoneDepthSort(pose1, pose2, weight);
  }
  
  GetActionFramePoses() {
    if(this.actionCtr >= this.actionLen && !this.action.loop) {
      var keyFrame1 = this.action.keyFrames[this.action.keyFrames.length - 1];
      var pose1 = this.content.poses[this.content.posesLookupIndex[keyFrame1.pose]];
      return [pose1, pose1, 1, keyFrame1];
    }
    
    var keyFrame1 = null;
    var keyFrame2 = null;
    var keyFrame1TimeInFrames = 0;
    var keyFrame2TimeInFrames = 0;
    var keyFrame1Time = 0;
    var keyFrame2Time = 0;

    for(var i = 0; i < this.action.keyFrames.length; i++) {
      var keyFrame = this.action.keyFrames[i];

      if(keyFrame.len == 0)
        continue;

      var nextKeyFrameTimeInFrames = keyFrame1TimeInFrames + keyFrame.len;
      var nextKeyFrameTime = nextKeyFrameTimeInFrames / Prime.SKELETON_FPS;

      if(this.actionCtr < nextKeyFrameTime) {
        keyFrame1 = keyFrame;
        if(i == this.action.keyFrames.length - 1)
          keyFrame2 = this.action.keyFrames[0];
        else
          keyFrame2 = this.action.keyFrames[i + 1];
        keyFrame2TimeInFrames = nextKeyFrameTimeInFrames;
        break;
      }

      keyFrame1TimeInFrames = nextKeyFrameTimeInFrames;
    }
    
    keyFrame1Time = keyFrame1TimeInFrames / Prime.SKELETON_FPS;
    keyFrame2Time = keyFrame2TimeInFrames / Prime.SKELETON_FPS;
    
    if(keyFrame1 == keyFrame2 || keyFrame1TimeInFrames == keyFrame2TimeInFrames) {
      var pose1 = this.content.poses[this.content.posesLookupIndex[keyFrame1.pose]];
      return [pose1, pose1, 0, keyFrame1];
    }
    else {
      var pose1 = this.content.poses[this.content.posesLookupIndex[keyFrame1.pose]];
      var pose2 = this.content.poses[this.content.posesLookupIndex[keyFrame2.pose]];
      var weight = (this.actionCtr - keyFrame1Time) / (keyFrame2Time - keyFrame1Time);
      return [pose1, pose2, weight, keyFrame1];
    }
  }
  
  PerformBoneDepthSort() {
    var actionFramePoses = this.GetActionFramePoses();
    var pose1 = actionFramePoses[0];
    var pose2 = actionFramePoses[1];
    var weight = actionFramePoses[2];
    
    this.PerformBoneDepthSort(pose1, pose2, weight);
  }
  
  PerformBoneDepthSort(pose1, pose2, weight) {
    if(!this.content)
      return;

    if(!this.affixes)
      return;

    if(!pose1)
      return;

    var content = this.content;
    
    var items = [];
    for(var i = 0; i < this.affixes.length; i++) {
      var affix = this.affixes[i];
      var boneIndex = content.bonesLookupIndex[affix.piece.pieceContent.affix];
      var bone = content.bones[boneIndex];
      items.push({
        affixIndex: i,
        boneIndex: boneIndex,
        depth: bone.depth + pose1.bones[boneIndex].depth,
        name: bone.name,
      });
    }
    
    items.sort(function(a, b) {
      if(a.depth < b.depth)
        return -1;
      else if(a.depth > b.depth)
        return 1;
      else {
        if(a.boneIndex < b.boneIndex)
          return -1;
        else if(a.boneIndex > b.boneIndex)
          return 1;
        else {
          if(a.affixIndex < b.affixIndex)
            return -1;
          else if(a.affixIndex > b.affixIndex)
            return 1;
          else
            return 0;
        }
      }
    });
    
    for(var i = 0; i < items.length; i++) {
      var item = items[i];
      var affix = this.affixes[item.affixIndex];
      if(affix) {
        $(affix.node).css('z-index', i);
      }
    }
  }
  
  WaitForAllPartsLoaded(callback) {
    var allSkinsets = [];
    
    if(this.skinset) {
      allSkinsets.push(this.skinset);
    }
    
    if(this.additionalSkinsets) {
      for(var i = 0; i < this.additionalSkinsets.length; i++) {
        var skinset = this.additionalSkinsets[i];
        allSkinsets.push(skinset);
      }      
    }
    
    if(allSkinsets.length > 0) {
      var self = this;
      var waitForAllPartsLoaded = function() {
        var allLoaded = true;
        
        for(var i = 0; i < allSkinsets.length; i++) {
          var skinset = allSkinsets[i];
          if(!skinset.AreAllPartsLoaded()) {
            allLoaded = false;
            break;
          }
        }
        
        if(allLoaded) {
          callback(self);          
        }
        else {
          setTimeout(waitForAllPartsLoaded, Prime.RetryTimeoutCommon);
        }
      };
      waitForAllPartsLoaded();    
    }
    else {
      callback(self);
    }
  }
  
  SetRandomActionEnabled(enabled) {
    this.randomActionEnabled = enabled;
  }
};

Prime.Rig = class extends Prime.ContentInstance {
  OnChangedContent() {
    super.OnChangedContent();

    if(this.HasContent()) {
      for(var i = 0; i < this.content.nodes.length; i++) {
        var contentNode = this.content.nodes[i];
        this.LoadContentNode(this, contentNode);
      }
    }
  }
  
  OnWillChangeContent() {
    this.children.DestroyAll();
  }
  
  LoadContentNode(parent, contentNode) {
    var cname = contentNode._className;
    var object = null;
    
    if(contentNode.content) {
      if(cname == 'RigNode') {
        object = parent.Create(Prime.Rig);
        object.SetContent(contentNode.content);
      }
      else if(cname == 'SkeletonNode') {
        object = parent.Create(Prime.Skeleton);
        object.SetContent(contentNode.content, function(skeleton) {
          skeleton.SetSkinset(contentNode.skinset);
        });
      }
      else if(cname == 'ScriptNode') {
        object = parent.Execute(contentNode.content);
      }
      else if(cname == 'ImagemapNode') {
        object = parent.Create(Prime.Imagemap);
        object.SetContent(contentNode.content, function(imagemap) {
          imagemap.SetRect(contentNode.rect);
        });
      }
    }
    else {
      object = parent.Create(Prime.Object);
    }
    
    if(object) {
      object.info.SetName(contentNode.name);
      object.transform.SetPos(contentNode.x, contentNode.y, contentNode.z);
      object.transform.SetScale(contentNode.scaleX, contentNode.scaleY, contentNode.scaleZ);
      object.transform.SetHFlip(contentNode.hflip);
      object.transform.SetVFlip(contentNode.vflip);
      object.transform.SetZIndex(contentNode.z);
    }
    
    for(var i = 0; i < contentNode.nodes.length; i++) {
      var childContentNode = contentNode.nodes[i];
      this.LoadContentNode(object, childContentNode);
    }
    
    return object;
  }
};

Prime.StringDatabase = class extends Prime.ContentInstance {
  OnChangedContent() {
    super.OnChangedContent();

    if(this.HasContent()) {
      for(var i = 0; i < this.content.strings.length; i++) {
        var string = this.content.strings[i];
        string.charsUTF8 = Prime.DecodeUnicode(string.chars);
      }
    }
  }
};

Prime.StringDatabases = [];

Prime.AddStringDatabase = function(path, readyCallback = null) {
  var result = new Prime.StringDatabase();
  result.SetContent(path, function(db) {
    Prime.StringDatabases.push(db);

    if(readyCallback)
      readyCallback(db);
  });
  return result;
};

Prime.AddStringDatabases = function(paths, readyCallback = null) {
  var dbReadyCount = 0;
  var result = [];
  for(var i = 0; i < paths.length; i++) {
    (function(index, path) {
      Prime.AddStringDatabase(path, function(db) {
        result[index] = db;
        dbReadyCount++;
      });
    })(i, paths[i]);    
  }

  var waitForResult = function() {
    if(dbReadyCount >= paths.length) {
      readyCallback(result);
    }
    else {
      setTimeout(waitForResult, Prime.RetryTimeoutCommon);
    }
  };
  waitForResult();
};

Prime.LL = function(s) {
  var dbs = Prime.StringDatabases;
  for(var i = dbs.length - 1; i >= 0; i--) {
    var db = dbs[i];
    var lookup = db.content.stringsLookupIndex[s];
    if(lookup != undefined) {
      return db.content.strings[lookup].charsUTF8;
    }
  }
  return s;
};

Prime.HTMLLabel = class extends Prime.Object {
  constructor(text = null, cssClass = null, textAlign = Prime.AlignCenter) {
    super();
    
    this.textNode = document.createElement('span');
    this.transform.node.append(this.textNode);

    this.textElementNode = document.createElement('span');
    this.textNode.append(this.textElementNode);

    this.text = null;
    this.cssClass = null;
    this.textAlign = textAlign;

    this.textHFlip = false;
    this.textVFlip = false;
    
    this.Config(text, cssClass, textAlign);
  }
  
  OnTransformNodeUpdated() {
    this.UpdateNode();
  }
  
  SetText(text) {
    this.text = text;
    this.UpdateNode();
  }
  
  SetCSSClass(cssClass) {
    this.cssClass = cssClass;
    this.UpdateNode();
  }
  
  SetTextAlign(textAlign) {
    this.textAlign = textAlign;
    this.UpdateNode();
  }
  
  SetTextHFlip(hflip) {
    this.textHFlip = hflip;
    this.UpdateNode();
  }
  
  SetTextVFlip(vflip) {
    this.textVFlip = vflip;
    this.UpdateNode();
  }
  
  Config(text, cssClass = null, textAlign = Prime.AlignCenter) {
    this.SetText(text);
    this.SetCSSClass(cssClass);
    this.SetTextAlign(textAlign);
  }
  
  UpdateNode() {
    if(this.cssClass != null) {
      $(this.textNode).attr('class', this.cssClass);
      $(this.textElementNode).attr('class', this.cssClass);
    }
    $(this.textElementNode).html(this.text);

    var parent = this.GetParent();
    var parentHFlip = parent ? parent.transform.GetHFlip() : false;
    var parentVFlip = parent ? parent.transform.GetVFlip() : false;

    var useHFlip = this.transform.GetHFlipToRoot() != this.textHFlip;
    var useVFlip = this.transform.GetVFlipToRoot() != this.textVFlip;

    var scaleX = useHFlip ? '-1' : '1';
    var scaleY = useVFlip ? '1' : '-1';
    
    var translateX = '0%';
    if((!parentHFlip && (this.textAlign & Prime.AlignRight)) || (parentHFlip && (this.textAlign & Prime.AlignLeft))) {
      translateX = '-100%';
    }
    else if(this.textAlign & Prime.AlignHCenter) {
      translateX = '-50%';
    }
    else if((!parentHFlip && (this.textAlign & Prime.AlignLeft)) || (parentHFlip && (this.textAlign & Prime.AlignRight))) {
      translateX = '0%';
    }
    
    var translateY = '0%';
    if((!parentVFlip && (this.textAlign & Prime.AlignTop)) || (parentVFlip && (this.textAlign & Prime.AlignBottom))) {
      translateY = '-100%';
    }
    else if(this.textAlign & Prime.AlignVCenter) {
      translateY = '-50%';
    }
    else if((!parentVFlip && (this.textAlign & Prime.AlignBottom)) || (parentVFlip && (this.textAlign & Prime.AlignTop))) {
      translateY = '0%';
    }

    $(this.textElementNode).attr('style', 'position: absolute; transform: translate(' + translateX + ', ' + translateY + ') scale(' + scaleX + ', ' + scaleY + ');');
    $(this.textNode).attr('style', 'position: relative;');
  }
};

Prime.ParticleSystem = class extends Prime.Object {
  constructor() {
    super();
    
    this.particleCount = 0;
    this.particles = [];
    
    this.indexCount = 0;
    this.itemSyncCount = 0;
    
    this.attachNode = null;
  }
  
  GetIndexCount() {
    return this.indexCount;
  }
  
  GetItemSyncCount() {
    return this.itemSyncCount;
  }
  
  OnCalc(dt) {
    for(var i = 0; i < this.particles.length; i++) {
      var particle = this.particles[i];
      if(particle.activated) {
        this.RunProgram(particle);
      }
    }
  }
  
  RunProgram(particle) {
    
  }
  
  Config(imagemapPath, particleCount, rects = null) {
    this.DestroyParticles();

    this.particleCount = particleCount;

    var parent = this.GetParent();
    for(var i = 0; i < this.particleCount; i++) {
      var node = document.createElement('div');
      var container = document.createElement('div');
      var img = document.createElement('img');
      node.append(container);
      container.append(img);

      $(node).css('position', 'absolute');

      var particle =  {
        node: node,
        container: container,
        img: img,
        item: {},
        activated: false,
      };

      $(node).hide();

      var attachNode = this.attachNode ? this.attachNode : this.transform.node;

      attachNode.append(particle.node);

      this.particles.push(particle);
    }

    var self = this;
    Prime.GetContent(imagemapPath, function(imagemapContent) {
      var imc = imagemapContent;
      self.imagemapContent = imc;

      var dataRatioN = imc.dataRatioN;
      var dataRatioD = imc.dataRatioD;
      var dataRatioInv = dataRatioD / dataRatioN;

      for(var i = 0; i < particleCount; i++) {
        var particle = self.particles[i];
        var node = particle.node;
        var container = particle.container;
        var img = particle.img;

        var rectName = rects ? rects[i % rects.length] : null;
        
        (function(rectName) {
          var rect;
          var texRect;
          if(rectName != null) {
            rect = imc.rects[imc.rectsLookupIndex[rectName]];
            texRect = imc.texRects[imc.texRectsLookupIndex[rectName]];
          }
          else {
            rect = imc.rects[i % imc.rects.length];
            texRect = imc.texRects[i % imc.texRects.length];
          }
          var origin = rect.points[rect.pointsLookupIndex['origin']];

          if(dataRatioN != dataRatioD) {
            var scaler = document.createElement('div');
            img.remove();
            container.append(scaler);
            scaler.append(img);
            $(scaler).attr('style', 'position: absolute; transform: scale(' + dataRatioInv + ');');
          }

          $(container).attr('style', 'overflow: hidden; position: absolute; width: ' + rect.dw + 'px; height: ' + rect.dh + 'px; transform: translate(' + (rect.sx - origin.x) + 'px, ' + (rect.sy - origin.y) + 'px);');

          $(img).attr('style', 'position: absolute; transform: translate(' + (-texRect.x) + 'px, ' + (-texRect.y) + 'px);');
          $(img).css('opacity', 0);

          $(img).attr('src', Prime.ContentPath + imc.imgPath + GVGet);
        })(rectName);
      }
    });
  }
  
  ConfigForHTML(particleCount, readyCallback = null) {
    this.DestroyParticles();
    
    this.particleCount = particleCount;

    var parent = this.GetParent();
    for(var i = 0; i < this.particleCount; i++) {
      var node = document.createElement('div');
      var container = document.createElement('div');
      node.append(container);

      $(node).attr('style', 'position: absolute');
      $(container).css('position', 'relative');
      $(container).css('transform', 'translate(-50%, 50%)');

      var particle =  {
        node: node,
        container: container,
        item: {},
        activated: false,
      };

      $(node).hide();

      this.transform.node.append(particle.node);

      this.particles.push(particle);
    }

  }
  
  DestroyParticles() {
    if(this.particles && this.particles.length > 0) {
      
    }
    
    this.particleCount = 0;
    this.particles = [];
  }
  
  SetIndexCount(indexCount) {
    this.indexCount = indexCount;
  }
  
  SetItemSyncCount(itemSyncCount) {
    this.itemSyncCount = itemSyncCount;
  }
  
  SetAttachNode(attachNode) {
    this.attachNode = attachNode;
  }
};

Prime.MonitoredParticleSystem = class extends Prime.ParticleSystem {
  constructor() {
    super();
    
    this.avail = [];
    this.particleIndexLookup = [];
    this.particleIndexLookupRev = [];
    this.numbersToRemove = [];
    this.calcActiveItems = [];
    
    this.maxNumber = 0;
    this.availTop = 0;
    
    this.programTime = 0;
  }
  
  OnCalc(dt) {
    this.CalcProgramTime(dt);
    super.OnCalc(dt);
    
    var time = this.GetProgramTime();
    var startParticleCount = this.GetActiveCount();
    var numbersToRemoveCount = 0;
    
    this.maxNumber = 0;
    
    while(this.calcActiveItems.length < startParticleCount)
      this.calcActiveItems.push({});

    this.GetActiveItems(this.calcActiveItems);
    for(var i = 0; i < startParticleCount; i++) {
      var item = this.calcActiveItems[i];
      
      if(this.ProcessActiveItem(item, time)) {
        this.numbersToRemove[numbersToRemoveCount++] = item.number;
      }
      else {
        if(this.maxNumber < item.number)
          this.maxNumber = item.number;
      }
    }

    // Trivial case, removing all particles in the system so none are left.
    if(this.numbersToRemoveCount == startParticleCount) {
      for(var i = 0; i < this.numbersToRemoveCount; i++) {
        var number = this.numbersToRemove[i];
        this.RemoveMonitoredActiveItem(number);
        this.avail[this.availTop++] = number;
      }

      this.maxNumber = 0;
      
      this.SetIndexCount(0);
      this.SetItemSyncCount(0);
      
      this.programTime = 0;
      
      return;
    }

    for(var i = 0; i < numbersToRemoveCount; i++) {
      var number = this.numbersToRemove[i];
      this.RemoveMonitoredActiveItem(number);
      this.avail[this.availTop++] = number;

      // Converting the number removal list into a particle index removal list on-the-fly.
      this.numbersToRemove[i] = this.particleIndexLookup[number];
    }

    if(numbersToRemoveCount) {
      var numbersToRemoveSorted = [];
      for(var i = 0; i < numbersToRemoveCount; i++) {
        numbersToRemoveSorted.push(this.numbersToRemove[i]);
      }
      
      numbersToRemoveSorted.sort(function(a, b) {
        if(a < b)
          return -1;
        else if(a > b)
          return 1;
        else
          return 0;
      });

      var removeIndex = 1;
      var toIndex = numbersToRemoveSorted[0];
      var fromIndex = toIndex + 1;

      while(true) {
        if(removeIndex < numbersToRemoveCount) {
          while(fromIndex == numbersToRemoveSorted[removeIndex]) {
            fromIndex++;
            if(++removeIndex == numbersToRemoveCount) {
              break;
            }
          }
        }

        if(fromIndex == startParticleCount) {
          break;
        }

        var blockEnd;
        if(removeIndex < numbersToRemoveCount) {
          blockEnd = numbersToRemoveSorted[removeIndex];
        }
        else {
          blockEnd = startParticleCount;
        }

        var count = blockEnd - fromIndex;
        for(var i = 0; i < count; i++) {
          var fi = fromIndex + i;
          var ti = toIndex + i;
          var temp = this.particles[ti];
          this.particles[ti] = this.particles[fi];
          this.particles[fi] = temp;
        }

        var stop = fromIndex + count;
        var index = toIndex;
        for(var i = fromIndex; i < stop; i++) {
          var number = this.particleIndexLookupRev[i];
          Prime.Assert(this.particleIndexLookup[number] == i, 'Unexpected value: lookup ' + number + ' should be ' + i + ', but is ' + this.particleIndexLookup[number] + '.');
          Prime.Assert(this.particleIndexLookupRev[i] == number, 'Unexpected value: lookup rev ' + i + ' should be ' + number + ', but is ' + this.particleIndexLookupRev[number] + '.');
          this.particleIndexLookup[number] = index;
          this.particleIndexLookupRev[index] = number;
          index++;
        }

        toIndex += count;
        fromIndex = blockEnd;
      }
      
      this.SetIndexCount(this.GetActiveCount());
    }
    
    this.SetItemSyncCount(this.maxNumber);
  }

  InitMonitoredParticleSystem(imagemapPath, particleCount, rects = null) {
    this.Config(imagemapPath, particleCount, rects);
    this.InitMonitoredParticleSystemCommon();
  }

  InitMonitoredParticleSystemForHTML(particleCount) {
    this.ConfigForHTML(particleCount);
    this.InitMonitoredParticleSystemCommon();
  }
  
  InitMonitoredParticleSystemCommon() {
    this.maxNumber = 0;
    this.availTop = this.particleCount;
    
    for(var i = this.particleCount; i > 0; i--) {
      this.avail.push(i);
      
      this.particleIndexLookup.push(0);
      this.particleIndexLookupRev.push(0);
      this.numbersToRemove.push(0);
    }
    
    // Add one for 1-based index lookup arrays.
    this.particleIndexLookup.push(0);
  }
  
  GetActiveCount() {
    return this.particleCount - this.availTop;
  }

  CalcProgramTime(dt) {
    this.programTime += dt;
  }
  
  GetProgramTime() {
    return this.programTime;
  } 
  
  PopAvail() {
    if(this.availTop) {
      var result = this.avail[--this.availTop];
      return result;
    }
    else {
      return 0;
    }
  }
  
  GetParticle(number) {
    return number > 0 ? this.particles[this.GetParticleIndex(number)] : null;
  }
  
  GetParticleItem(index) {
    return this.particles[index].item;
  }

  GetParticleIndex(number) {
    return this.particleIndexLookup[number];
  }
  
  ClearAll() {
    this.ClearAllActiveItems();

    for(var i = particleCount; i > 0; i--) {
      this.avail[particleCount - i] = i;
    }

    this.maxNumber = 0;
    this.availTop = this.particleCount;

    this.SetIndexCount(0);
    this.SetItemSyncCount(0);

    this.programTime = 0;
  }
 
  RemoveMonitoredActiveItem(number) {
    this.RemoveActiveItem(number);
    var particle = this.GetParticle(number);
    if(particle) {
      $(particle.node).hide();
    }
  }

  RegisterParticle(number, particleIndex) {
    this.particleIndexLookup[number] = particleIndex;
    this.particleIndexLookupRev[particleIndex] = number;
    
    this.SetIndexCount(this.GetActiveCount());
    
    if(this.maxNumber < number) {
      this.maxNumber = number;
      this.SetItemSyncCount(this.maxNumber);
    }
    
    var particle = this.GetParticle(number);
    particle.activated = true;
    this.RunProgram(particle);    
    $(particle.node).show();
  }
 
  AddAt(x, y, z) {
    return 0;
  }
};

Prime.VaporParticleSystem = class extends Prime.MonitoredParticleSystem {
  constructor() {
    super();
    
    this.FADE_INTRO = 0.1;
    this.FADE_OUTRO = 0.4;
    
    this.active = {};
  }
  
  InitVaporParticleSystem(imagemapPath, particleCount, rects = null) {
    this.InitMonitoredParticleSystem(imagemapPath, particleCount, rects);    
  }
  
  GetActiveItems(items) {
    var count = 0;
    
    for(var key in this.active) {
      if(this.active.hasOwnProperty(key)) {
        var value = this.active[key];
        var item = items[count++];
        item.item = value;
        item.number = key;
      }
    }
    
    return count;
  }
  
  ProcessActiveItem(item, time) {
    var activeItem = item.item;
    return time >= activeItem.startTime + activeItem.cycle;
  }
  
  RemoveActiveItem(number) {
    delete this.active[number];
  }
  
  ClearAllActiveItems() {
    this.active = {};
  }
  
  Add(x, y, z,
    vx, vy, vz,
    cycle,
    scaleStart, scaleEnd,
    rotateSpeed) {
    
    var number = this.PopAvail();
    if(number == 0)
      return 0;
      
    var particleIndex = this.GetActiveCount() - 1;
    var startTime = this.GetProgramTime();
    var item = this.GetParticleItem(particleIndex); 
    
    item.x = x;
    item.y = y;
    item.z = z;
    
    item.vx = vx;
    item.vy = vy;
    item.vz = vz;
    
    item.time = startTime;
    item.cycle = cycle;
    
    item.scaleStart = scaleStart;
    item.scaleEnd = scaleEnd;
    item.rotateSpeed = rotateSpeed;
    
    this.RegisterParticle(number, particleIndex);
    
    this.active[number] = {startTime: startTime, cycle: cycle};
    
    return number;
  }
  
  AddAt(x, y, z) {
    var rng = PxRandom;
    
    return this.Add(x, y, z,
      rng.GetRangeFloat(-50, 50), rng.GetRangeFloat(180, 240), 0,
      rng.GetRangeFloat(2.0, 2.8),
      1.0, 1.2,
      rng.GetRangeFloat(-3, 3) * Prime.TwoPi);
  }
  
  RunProgram(particle) {
    var item = particle.item;
    var time = this.GetProgramTime();
    var node = particle.node;
    var img = particle.img;
    
    var useTime = (time - item.time) % item.cycle;    
    var t = useTime / item.cycle;
    var scale = PxMath.GetLerp(item.scaleStart, item.scaleEnd, t);
    var angle = useTime * item.rotateSpeed * Prime.PiBy180;

    var x = item.x + item.vx * useTime;
    var y = item.y + item.vy * useTime;
    var z = item.z + item.vz * useTime;
    
    var fade = t < this.FADE_INTRO ? (t / this.FADE_INTRO) : (t > (1.0 - this.FADE_OUTRO) ? (1.0 - t) / this.FADE_OUTRO : 1.0);

    $(node).css('transform', 'translate(' + (x) + 'px, ' + (y) + 'px) rotate(' + angle + 'deg) scale(' + scale + ', ' + (-scale) + ')');
    $(node).css('z-index', z);
    $(img).css('opacity', fade);
  }
};

Prime.ForceParticleSystem = class extends Prime.MonitoredParticleSystem {
  constructor() {
    super();
    
    this.FADE_INTRO = 0.1;
    this.FADE_OUTRO = 0.4;
    
    this.active = {};
  }
  
  InitForceParticleSystem(imagemapPath, particleCount, rects = null) {
    this.InitMonitoredParticleSystem(imagemapPath, particleCount, rects);    
  }
  
  GetActiveItems(items) {
    var count = 0;
    
    for(var key in this.active) {
      if(this.active.hasOwnProperty(key)) {
        var value = this.active[key];
        var item = items[count++];
        item.item = value;
        item.number = key;
      }
    }
    
    return count;
  }
  
  ProcessActiveItem(item, time) {
    var activeItem = item.item;
    return time >= activeItem.startTime + activeItem.cycle;
  }
  
  RemoveActiveItem(number) {
    delete this.active[number];
  }
  
  ClearAllActiveItems() {
    this.active = {};
  }
  
  Add(x, y, z,
    vx, vy, vz,
    fx, fy, fz,
    cycle,
    scaleStart, scaleEnd,
    rotateSpeed) {
    
    var number = this.PopAvail();
    if(number == 0)
      return 0;
      
    var particleIndex = this.GetActiveCount() - 1;
    var startTime = this.GetProgramTime();
    var item = this.GetParticleItem(particleIndex); 
    
    item.x = x;
    item.y = y;
    item.z = z;
    
    item.vx = vx;
    item.vy = vy;
    item.vz = vz;
    
    item.fx = fx;
    item.fy = fy;
    item.fz = fz;
    
    item.time = startTime;
    item.cycle = cycle;
    
    item.scaleStart = scaleStart;
    item.scaleEnd = scaleEnd;
    item.rotateSpeed = rotateSpeed;
    
    this.RegisterParticle(number, particleIndex);
    
    this.active[number] = {startTime: startTime, cycle: cycle};
    
    return number;
  }
  
  AddAt(x, y, z) {
    var rng = PxRandom;
    
    return this.Add(x, y, z,
      rng.GetRangeFloat(-50, 50), rng.GetRangeFloat(180, 240), 0,
      0, 0, 0,
      rng.GetRangeFloat(2.0, 2.8),
      1.0, 1.2,
      rng.GetRangeFloat(-3, 3) * Prime.TwoPi);
  }
  
  RunProgram(particle) {
    var item = particle.item;
    var time = this.GetProgramTime();
    var node = particle.node;
    var img = particle.img;
    
    var useTime = (time - item.time) % item.cycle;    
    var useTimeSq = useTime * useTime;
    var t = useTime / item.cycle;
    var scale = PxMath.GetLerp(item.scaleStart, item.scaleEnd, t);
    var angle = useTime * item.rotateSpeed * Prime.PiBy180;

    var x = item.x + item.vx * useTime + item.fx * useTimeSq;
    var y = item.y + item.vy * useTime + item.fy * useTimeSq;
    var z = item.z + item.vz * useTime + item.fz * useTimeSq;
    
    var fade = t < this.FADE_INTRO ? (t / this.FADE_INTRO) : (t > (1.0 - this.FADE_OUTRO) ? (1.0 - t) / this.FADE_OUTRO : 1.0);

    $(node).css('transform', 'translate(' + (x) + 'px, ' + (y) + 'px) rotate(' + angle + 'deg) scale(' + scale + ', ' + (-scale) + ')');
    $(node).css('z-index', z);
    $(img).css('opacity', fade);
  }
};

Prime.HTMLLabelParticleSystem = class extends Prime.MonitoredParticleSystem {
  constructor() {
    super();
    
    this.FADE_INTRO = 0.1;
    this.FADE_OUTRO = 0.4;
    
    this.active = {};
  }
  
  InitHTMLLabelParticleSystem(particleCount) {
    this.InitMonitoredParticleSystemForHTML(particleCount);    
  }
  
  GetActiveItems(items) {
    var count = 0;
    
    for(var key in this.active) {
      if(this.active.hasOwnProperty(key)) {
        var value = this.active[key];
        var item = items[count++];
        item.item = value;
        item.number = key;
      }
    }
    
    return count;
  }
  
  ProcessActiveItem(item, time) {
    var activeItem = item.item;
    return time >= activeItem.startTime + activeItem.cycle;
  }
  
  RemoveActiveItem(number) {
    delete this.active[number];
  }
  
  ClearAllActiveItems() {
    this.active = {};
  }
  
  Add(html, cssClass,
    x, y, z,
    vx, vy, vz,
    cycle,
    scaleStart = 1, scaleEnd = 1,
    rotateSpeed = 0) {
    
    var number = this.PopAvail();
    if(number == 0)
      return 0;
      
    var particleIndex = this.GetActiveCount() - 1;
    var startTime = this.GetProgramTime();
    var item = this.GetParticleItem(particleIndex); 

    item.html = html;
    item.cssClass = cssClass;
    
    item.x = x;
    item.y = y;
    item.z = z;
    
    item.vx = vx;
    item.vy = vy;
    item.vz = vz;
    
    item.time = startTime;
    item.cycle = cycle;
    
    item.scaleStart = scaleStart;
    item.scaleEnd = scaleEnd;
    item.rotateSpeed = rotateSpeed;
    
    this.RegisterParticle(number, particleIndex);
    
    this.active[number] = {startTime: startTime, cycle: cycle};
    
    return number;
  }
  
  RunProgram(particle) {
    var item = particle.item;
    var time = this.GetProgramTime();
    var node = particle.node;
    var container = particle.container;
    
    var useTime = (time - item.time) % item.cycle;    
    var t = useTime / item.cycle;
    var scale = PxMath.GetLerp(item.scaleStart, item.scaleEnd, t);
    var angle = useTime * item.rotateSpeed * Prime.PiBy180;

    var x = item.x + item.vx * useTime;
    var y = item.y + item.vy * useTime;
    var z = item.z + item.vz * useTime;
    
    var fade = t < this.FADE_INTRO ? (t / this.FADE_INTRO) : (t > (1.0 - this.FADE_OUTRO) ? (1.0 - t) / this.FADE_OUTRO : 1.0);

    $(node).css('transform', 'translate(' + (x) + 'px, ' + (y) + 'px) rotate(' + angle + 'deg) scale(' + scale + ', ' + (-scale) + ')');
    $(node).css('z-index', z);
    $(container).html(item.html);
    $(container).attr('class', item.cssClass);
    $(container).css('opacity', fade);
  }
};

Prime.CalcEngine = class {
  constructor(tickRate = 1 / 30) {
    this.tickRate = tickRate;
    this.systemTime = 0;
    this.calcLastTime = Prime.CalcEngine.GetSystemTime();
    this.calcObjects = [];
  }

  Start() {
    this.Stop();

    this.calcLastTime = Prime.CalcEngine.GetSystemTime();
    this.CalcCore();
    this.timerId = setInterval(this.CalcCore.bind(this), this.tickRate * 1000);
  }

  Stop() {
    if(this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  CalcCore() {
    var calcTime = Prime.CalcEngine.GetSystemTime();
    var dt = calcTime - this.calcLastTime;
    this.calcLastTime = calcTime;
    try {
      this.Calc(dt);
      Prime.ProcessObjectDestroy();
    }
    catch(e) {
      this.Stop();
      Prime.DPrint(e);
      throw e;
    }
  }

  Calc(dt) {
    this.systemTime += dt;
    
    // Calc objects.
    for(var i = 0; i < this.calcObjects.length; i++) {
      var object = this.calcObjects[i];
      if(typeof object == 'function') {
        object(dt);
      }
      else {
        object.Calc(dt);
      }
    }
  }
  
  AddCalcObject(object) {
    this.calcObjects.push(object);
  }

  RemoveCalcObject(object) {
    for(var i = 0; i < this.calcObjects.length; i++) {
      if(this.calcObjects[i] == object) {
        this.calcObjects.splice(i, 1);
        return;
      }
    }
  }

  static GetSystemTime() {
    return (new Date()).getTime() / 1000.0;
  }
};

PxRandom = new Prime.Random();
PxRandom.Seed(Prime.CalcEngine.GetSystemTime());

PxMath = new Prime.Math();

LL = Prime.LL;
