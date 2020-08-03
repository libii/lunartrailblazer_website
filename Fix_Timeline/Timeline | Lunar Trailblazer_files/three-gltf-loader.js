THREE.GLTFLoader = function () {
  function e(e) {
    this.manager = void 0 !== e ? e : THREE.DefaultLoadingManager, this.dracoLoader = null
  }
  e.prototype = {
    constructor: e,
    crossOrigin: "Anonymous",
    load: function (e, t, a, r) {
      var s = this,
        i = void 0 !== this.path ? this.path : THREE.LoaderUtils.extractUrlBase(e),
        n = new THREE.FileLoader(s.manager);
      n.setResponseType("arraybuffer"), n.load(e, function (e) {
        try {
          s.parse(e, i, t, r)
        } catch (e) {
          if (void 0 === r) throw e;
          r(e)
        }
      }, a, r)
    },
    setCrossOrigin: function (e) {
      return this.crossOrigin = e, this
    },
    setPath: function (e) {
      return this.path = e, this
    },
    setDRACOLoader: function (e) {
      return this.dracoLoader = e, this
    },
    parse: function (e, o, l, p) {
      var u, c = {};
      if ("string" == typeof e) u = e;
      else if (THREE.LoaderUtils.decodeText(new Uint8Array(e, 0, 4)) === r) {
        try {
          c[t.KHR_BINARY_GLTF] = new function (e) {
            this.name = t.KHR_BINARY_GLTF, this.content = null, this.body = null;
            var a = new DataView(e, 0, s);
            if (this.header = {
                magic: THREE.LoaderUtils.decodeText(new Uint8Array(e.slice(0, 4))),
                version: a.getUint32(4, !0),
                length: a.getUint32(8, !0)
              }, this.header.magic !== r) throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");
            if (this.header.version < 2) throw new Error("THREE.GLTFLoader: Legacy binary file detected. Use LegacyGLTFLoader instead.");
            for (var n = new DataView(e, s), o = 0; o < n.byteLength;) {
              var l = n.getUint32(o, !0);
              o += 4;
              var p = n.getUint32(o, !0);
              if (o += 4, p === i.JSON) {
                var u = new Uint8Array(e, s + o, l);
                this.content = THREE.LoaderUtils.decodeText(u)
              } else if (p === i.BIN) {
                var c = s + o;
                this.body = e.slice(c, c + l)
              }
              o += l
            }
            if (null === this.content) throw new Error("THREE.GLTFLoader: JSON content not found.")
          }(e)
        } catch (e) {
          return void(p && p(e))
        }
        u = c[t.KHR_BINARY_GLTF].content
      } else u = THREE.LoaderUtils.decodeText(new Uint8Array(e));
      var d = JSON.parse(u);
      void 0 === d.asset || d.asset.version[0] < 2 ? p && p(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported. Use LegacyGLTFLoader instead.")) : (d.extensionsUsed && (d.extensionsUsed.indexOf(t.KHR_LIGHTS) >= 0 && (c[t.KHR_LIGHTS] = new function (e) {
        this.name = t.KHR_LIGHTS, this.lights = {};
        var a = (e.extensions && e.extensions[t.KHR_LIGHTS] || {}).lights || {};
        for (var r in a) {
          var s, i = a[r],
            n = (new THREE.Color).fromArray(i.color);
          switch (i.type) {
            case "directional":
              (s = new THREE.DirectionalLight(n)).position.set(0, 0, 1);
              break;
            case "point":
              s = new THREE.PointLight(n);
              break;
            case "spot":
              (s = new THREE.SpotLight(n)).position.set(0, 0, 1);
              break;
            case "ambient":
              s = new THREE.AmbientLight(n)
          }
          s && (void 0 !== i.constantAttenuation && (s.intensity = i.constantAttenuation), void 0 !== i.linearAttenuation && (s.distance = 1 / i.linearAttenuation), void 0 !== i.quadraticAttenuation && (s.decay = i.quadraticAttenuation), void 0 !== i.fallOffAngle && (s.angle = i.fallOffAngle), void 0 !== i.fallOffExponent && console.warn("THREE.GLTFLoader:: light.fallOffExponent not currently supported."), s.name = i.name || "light_" + r, this.lights[r] = s)
        }
      }(d)), d.extensionsUsed.indexOf(t.KHR_MATERIALS_UNLIT) >= 0 && (c[t.KHR_MATERIALS_UNLIT] = new a(d)), d.extensionsUsed.indexOf(t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS) >= 0 && (c[t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS] = new function () {
        return {
          name: t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS,
          specularGlossinessParams: ["color", "map", "lightMap", "lightMapIntensity", "aoMap", "aoMapIntensity", "emissive", "emissiveIntensity", "emissiveMap", "bumpMap", "bumpScale", "normalMap", "displacementMap", "displacementScale", "displacementBias", "specularMap", "specular", "glossinessMap", "glossiness", "alphaMap", "envMap", "envMapIntensity", "refractionRatio"],
          getMaterialType: function () {
            return THREE.ShaderMaterial
          },
          extendParams: function (e, t, a) {
            var r = t.extensions[this.name],
              s = THREE.ShaderLib.standard,
              i = THREE.UniformsUtils.clone(s.uniforms),
              n = ["#ifdef USE_SPECULARMAP", "\tuniform sampler2D specularMap;", "#endif"].join("\n"),
              o = ["#ifdef USE_GLOSSINESSMAP", "\tuniform sampler2D glossinessMap;", "#endif"].join("\n"),
              l = ["vec3 specularFactor = specular;", "#ifdef USE_SPECULARMAP", "\tvec4 texelSpecular = texture2D( specularMap, vUv );", "\ttexelSpecular = sRGBToLinear( texelSpecular );", "\t// reads channel RGB, compatible with a glTF Specular-Glossiness (RGBA) texture", "\tspecularFactor *= texelSpecular.rgb;", "#endif"].join("\n"),
              p = ["float glossinessFactor = glossiness;", "#ifdef USE_GLOSSINESSMAP", "\tvec4 texelGlossiness = texture2D( glossinessMap, vUv );", "\t// reads channel A, compatible with a glTF Specular-Glossiness (RGBA) texture", "\tglossinessFactor *= texelGlossiness.a;", "#endif"].join("\n"),
              u = ["PhysicalMaterial material;", "material.diffuseColor = diffuseColor.rgb;", "material.specularRoughness = clamp( 1.0 - glossinessFactor, 0.04, 1.0 );", "material.specularColor = specularFactor.rgb;"].join("\n"),
              c = s.fragmentShader.replace("#include <specularmap_fragment>", "").replace("uniform float roughness;", "uniform vec3 specular;").replace("uniform float metalness;", "uniform float glossiness;").replace("#include <roughnessmap_pars_fragment>", n).replace("#include <metalnessmap_pars_fragment>", o).replace("#include <roughnessmap_fragment>", l).replace("#include <metalnessmap_fragment>", p).replace("#include <lights_physical_fragment>", u);
            delete i.roughness, delete i.metalness, delete i.roughnessMap, delete i.metalnessMap, i.specular = {
              value: (new THREE.Color).setHex(1118481)
            }, i.glossiness = {
              value: .5
            }, i.specularMap = {
              value: null
            }, i.glossinessMap = {
              value: null
            }, e.vertexShader = s.vertexShader, e.fragmentShader = c, e.uniforms = i, e.defines = {
              STANDARD: ""
            }, e.color = new THREE.Color(1, 1, 1), e.opacity = 1;
            var d = [];
            if (Array.isArray(r.diffuseFactor)) {
              var h = r.diffuseFactor;
              e.color.fromArray(h), e.opacity = h[3]
            }
            if (void 0 !== r.diffuseTexture && d.push(a.assignTexture(e, "map", r.diffuseTexture.index)), e.emissive = new THREE.Color(0, 0, 0), e.glossiness = void 0 !== r.glossinessFactor ? r.glossinessFactor : 1, e.specular = new THREE.Color(1, 1, 1), Array.isArray(r.specularFactor) && e.specular.fromArray(r.specularFactor), void 0 !== r.specularGlossinessTexture) {
              var E = r.specularGlossinessTexture.index;
              d.push(a.assignTexture(e, "glossinessMap", E)), d.push(a.assignTexture(e, "specularMap", E))
            }
            return Promise.all(d)
          },
          createMaterial: function (e) {
            var t = new THREE.ShaderMaterial({
              defines: e.defines,
              vertexShader: e.vertexShader,
              fragmentShader: e.fragmentShader,
              uniforms: e.uniforms,
              fog: !0,
              lights: !0,
              opacity: e.opacity,
              transparent: e.transparent
            });
            return t.isGLTFSpecularGlossinessMaterial = !0, t.color = e.color, t.map = void 0 === e.map ? null : e.map, t.lightMap = null, t.lightMapIntensity = 1, t.aoMap = void 0 === e.aoMap ? null : e.aoMap, t.aoMapIntensity = 1, t.emissive = e.emissive, t.emissiveIntensity = 1, t.emissiveMap = void 0 === e.emissiveMap ? null : e.emissiveMap, t.bumpMap = void 0 === e.bumpMap ? null : e.bumpMap, t.bumpScale = 1, t.normalMap = void 0 === e.normalMap ? null : e.normalMap, e.normalScale && (t.normalScale = e.normalScale), t.displacementMap = null, t.displacementScale = 1, t.displacementBias = 0, t.specularMap = void 0 === e.specularMap ? null : e.specularMap, t.specular = e.specular, t.glossinessMap = void 0 === e.glossinessMap ? null : e.glossinessMap, t.glossiness = e.glossiness, t.alphaMap = null, t.envMap = void 0 === e.envMap ? null : e.envMap, t.envMapIntensity = 1, t.refractionRatio = .98, t.extensions.derivatives = !0, t
          },
          cloneMaterial: function (e) {
            var t = e.clone();
            t.isGLTFSpecularGlossinessMaterial = !0;
            for (var a = this.specularGlossinessParams, r = 0, s = a.length; r < s; r++) t[a[r]] = e[a[r]];
            return t
          },
          refreshUniforms: function (e, t, a, r, s, i) {
            if (!0 === s.isGLTFSpecularGlossinessMaterial) {
              var n, o, l, p = s.uniforms,
                u = s.defines;
              if (p.opacity.value = s.opacity, p.diffuse.value.copy(s.color), p.emissive.value.copy(s.emissive).multiplyScalar(s.emissiveIntensity), p.map.value = s.map, p.specularMap.value = s.specularMap, p.alphaMap.value = s.alphaMap, p.lightMap.value = s.lightMap, p.lightMapIntensity.value = s.lightMapIntensity, p.aoMap.value = s.aoMap, p.aoMapIntensity.value = s.aoMapIntensity, s.map ? n = s.map : s.specularMap ? n = s.specularMap : s.displacementMap ? n = s.displacementMap : s.normalMap ? n = s.normalMap : s.bumpMap ? n = s.bumpMap : s.glossinessMap ? n = s.glossinessMap : s.alphaMap ? n = s.alphaMap : s.emissiveMap && (n = s.emissiveMap), void 0 !== n)
                if (n.isWebGLRenderTarget && (n = n.texture), void 0 !== n.matrix) {
                  if (!0 === n.matrixAutoUpdate) {
                    o = n.offset, l = n.repeat;
                    var c = n.rotation,
                      d = n.center;
                    n.matrix.setUvTransform(o.x, o.y, l.x, l.y, c, d.x, d.y)
                  }
                  p.uvTransform.value.copy(n.matrix)
                } else o = n.offset, l = n.repeat, p.offsetRepeat.value.set(o.x, o.y, l.x, l.y);
              p.envMap.value = s.envMap, p.envMapIntensity.value = s.envMapIntensity, p.flipEnvMap.value = s.envMap && s.envMap.isCubeTexture ? -1 : 1, p.refractionRatio.value = s.refractionRatio, p.specular.value.copy(s.specular), p.glossiness.value = s.glossiness, p.glossinessMap.value = s.glossinessMap, p.emissiveMap.value = s.emissiveMap, p.bumpMap.value = s.bumpMap, p.normalMap.value = s.normalMap, p.displacementMap.value = s.displacementMap, p.displacementScale.value = s.displacementScale, p.displacementBias.value = s.displacementBias, null !== p.glossinessMap.value && void 0 === u.USE_GLOSSINESSMAP && (u.USE_GLOSSINESSMAP = "", u.USE_ROUGHNESSMAP = ""), null === p.glossinessMap.value && void 0 !== u.USE_GLOSSINESSMAP && (delete u.USE_GLOSSINESSMAP, delete u.USE_ROUGHNESSMAP)
            }
          }
        }
      }), d.extensionsUsed.indexOf(t.KHR_DRACO_MESH_COMPRESSION) >= 0 && (c[t.KHR_DRACO_MESH_COMPRESSION] = new n(this.dracoLoader))), console.time("GLTFLoader"), new S(d, c, {
        path: o || this.path || "",
        crossOrigin: this.crossOrigin,
        manager: this.manager
      }).parse(function (e, t, a, r, s) {
        console.timeEnd("GLTFLoader"), l({
          scene: e,
          scenes: t,
          cameras: a,
          animations: r,
          asset: s
        })
      }, p))
    }
  };
  var t = {
    KHR_BINARY_GLTF: "KHR_binary_glTF",
    KHR_DRACO_MESH_COMPRESSION: "KHR_draco_mesh_compression",
    KHR_LIGHTS: "KHR_lights",
    KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS: "KHR_materials_pbrSpecularGlossiness",
    KHR_MATERIALS_UNLIT: "KHR_materials_unlit"
  };

  function a(e) {
    this.name = t.KHR_MATERIALS_UNLIT
  }
  a.prototype.getMaterialType = function (e) {
    return THREE.MeshBasicMaterial
  }, a.prototype.extendParams = function (e, t, a) {
    var r = [];
    e.color = new THREE.Color(1, 1, 1), e.opacity = 1;
    var s = t.pbrMetallicRoughness;
    if (s) {
      if (Array.isArray(s.baseColorFactor)) {
        var i = s.baseColorFactor;
        e.color.fromArray(i), e.opacity = i[3]
      }
      void 0 !== s.baseColorTexture && r.push(a.assignTexture(e, "map", s.baseColorTexture.index))
    }
    return Promise.all(r)
  };
  var r = "glTF",
    s = 12,
    i = {
      JSON: 1313821514,
      BIN: 5130562
    };

  function n(e) {
    if (!e) throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");
    this.name = t.KHR_DRACO_MESH_COMPRESSION, this.dracoLoader = e
  }

  function o(e, t, a, r) {
    THREE.Interpolant.call(this, e, t, a, r)
  }
  n.prototype.decodePrimitive = function (e, t) {
    var a = this.dracoLoader,
      r = e.extensions[this.name].bufferView,
      s = e.extensions[this.name].attributes,
      i = {};
    for (var n in s) n in E && (i[E[n]] = s[n]);
    return t.getDependency("bufferView", r).then(function (e) {
      return new Promise(function (t) {
        a.decodeDracoFile(e, t, i)
      })
    })
  }, o.prototype = Object.create(THREE.Interpolant.prototype), o.prototype.constructor = o, o.prototype.interpolate_ = function (e, t, a, r) {
    for (var s = this.resultBuffer, i = this.sampleValues, n = this.valueSize, o = 2 * n, l = 3 * n, p = r - t, u = (a - t) / p, c = u * u, d = c * u, h = e * l, E = h - l, m = 2 * d - 3 * c + 1, f = d - 2 * c + u, v = -2 * d + 3 * c, T = d - c, R = 0; R !== n; R++) {
      var g = i[E + R + n],
        M = i[E + R + o] * p,
        S = i[h + R + n],
        H = i[h + R] * p;
      s[R] = m * g + f * M + v * S + T * H
    }
    return s
  };
  var l = (Number, THREE.Matrix3, THREE.Matrix4, THREE.Vector2, THREE.Vector3, THREE.Vector4, THREE.Texture, {
      5120: Int8Array,
      5121: Uint8Array,
      5122: Int16Array,
      5123: Uint16Array,
      5125: Uint32Array,
      5126: Float32Array
    }),
    p = {
      9728: THREE.NearestFilter,
      9729: THREE.LinearFilter,
      9984: THREE.NearestMipMapNearestFilter,
      9985: THREE.LinearMipMapNearestFilter,
      9986: THREE.NearestMipMapLinearFilter,
      9987: THREE.LinearMipMapLinearFilter
    },
    u = {
      33071: THREE.ClampToEdgeWrapping,
      33648: THREE.MirroredRepeatWrapping,
      10497: THREE.RepeatWrapping
    },
    c = {
      6406: THREE.AlphaFormat,
      6407: THREE.RGBFormat,
      6408: THREE.RGBAFormat,
      6409: THREE.LuminanceFormat,
      6410: THREE.LuminanceAlphaFormat
    },
    d = {
      5121: THREE.UnsignedByteType,
      32819: THREE.UnsignedShort4444Type,
      32820: THREE.UnsignedShort5551Type,
      33635: THREE.UnsignedShort565Type
    },
    h = (THREE.BackSide, THREE.FrontSide, THREE.NeverDepth, THREE.LessDepth, THREE.EqualDepth, THREE.LessEqualDepth, THREE.GreaterEqualDepth, THREE.NotEqualDepth, THREE.GreaterEqualDepth, THREE.AlwaysDepth, THREE.AddEquation, THREE.SubtractEquation, THREE.ReverseSubtractEquation, THREE.ZeroFactor, THREE.OneFactor, THREE.SrcColorFactor, THREE.OneMinusSrcColorFactor, THREE.SrcAlphaFactor, THREE.OneMinusSrcAlphaFactor, THREE.DstAlphaFactor, THREE.OneMinusDstAlphaFactor, THREE.DstColorFactor, THREE.OneMinusDstColorFactor, THREE.SrcAlphaSaturateFactor, {
      SCALAR: 1,
      VEC2: 2,
      VEC3: 3,
      VEC4: 4,
      MAT2: 4,
      MAT3: 9,
      MAT4: 16
    }),
    E = {
      POSITION: "position",
      NORMAL: "normal",
      TEXCOORD_0: "uv",
      TEXCOORD0: "uv",
      TEXCOORD: "uv",
      TEXCOORD_1: "uv2",
      COLOR_0: "color",
      COLOR0: "color",
      COLOR: "color",
      WEIGHTS_0: "skinWeight",
      WEIGHT: "skinWeight",
      JOINTS_0: "skinIndex",
      JOINT: "skinIndex"
    },
    m = {
      scale: "scale",
      translation: "position",
      rotation: "quaternion",
      weights: "morphTargetInfluences"
    },
    f = {
      CUBICSPLINE: THREE.InterpolateSmooth,
      LINEAR: THREE.InterpolateLinear,
      STEP: THREE.InterpolateDiscrete
    };

  function v(e, t) {
    return "string" != typeof e || "" === e ? "" : /^(https?:)?\/\//i.test(e) ? e : /^data:.*,.*$/i.test(e) ? e : /^blob:.*$/i.test(e) ? e : t + e
  }

  function T(e, t, a, r) {
    var s = e.geometry,
      i = e.material,
      n = a.targets,
      o = s.morphAttributes;
    o.position = [], o.normal = [], i.morphTargets = !0;
    for (var l = 0, p = n.length; l < p; l++) {
      var u, c, d = n[l],
        h = "morphTarget" + l;
      if (void 0 !== d.POSITION) {
        u = M(r[d.POSITION]);
        for (var E = s.attributes.position, m = 0, f = u.count; m < f; m++) u.setXYZ(m, u.getX(m) + E.getX(m), u.getY(m) + E.getY(m), u.getZ(m) + E.getZ(m))
      } else s.attributes.position && (u = M(s.attributes.position));
      if (void 0 !== u && (u.name = h, o.position.push(u)), void 0 !== d.NORMAL) {
        i.morphNormals = !0, c = M(r[d.NORMAL]);
        var v = s.attributes.normal;
        for (m = 0, f = c.count; m < f; m++) c.setXYZ(m, c.getX(m) + v.getX(m), c.getY(m) + v.getY(m), c.getZ(m) + v.getZ(m))
      } else void 0 !== s.attributes.normal && (c = M(s.attributes.normal));
      void 0 !== c && (c.name = h, o.normal.push(c))
    }
    if (e.updateMorphTargets(), void 0 !== t.weights)
      for (l = 0, p = t.weights.length; l < p; l++) e.morphTargetInfluences[l] = t.weights[l];
    if (t.extras && Array.isArray(t.extras.targetNames))
      for (l = 0, p = t.extras.targetNames.length; l < p; l++) e.morphTargetDictionary[t.extras.targetNames[l]] = l
  }

  function R(e, t) {
    if (e.indices !== t.indices) return !1;
    var a = e.attributes || {},
      r = t.attributes || {},
      s = Object.keys(a),
      i = Object.keys(r);
    if (s.length !== i.length) return !1;
    for (var n = 0, o = s.length; n < o; n++) {
      var l = s[n];
      if (a[l] !== r[l]) return !1
    }
    return !0
  }

  function g(e, t) {
    for (var a = 0, r = e.length; a < r; a++) {
      var s = e[a];
      if (R(s.primitive, t)) return s.promise
    }
    return null
  }

  function M(e) {
    if (e.isInterleavedBufferAttribute) {
      for (var t = e.count, a = e.itemSize, r = e.array.slice(0, t * a), s = 0; s < t; ++s) r[s] = e.getX(s), a >= 2 && (r[s + 1] = e.getY(s)), a >= 3 && (r[s + 2] = e.getZ(s)), a >= 4 && (r[s + 3] = e.getW(s));
      return new THREE.BufferAttribute(r, a, e.normalized)
    }
    return e.clone()
  }

  function S(e, t, a) {
    this.json = e || {}, this.extensions = t || {}, this.options = a || {}, this.cache = new function () {
      var e = {};
      return {
        get: function (t) {
          return e[t]
        },
        add: function (t, a) {
          e[t] = a
        },
        remove: function (t) {
          delete e[t]
        },
        removeAll: function () {
          e = {}
        }
      }
    }, this.primitiveCache = [], this.textureLoader = new THREE.TextureLoader(this.options.manager), this.textureLoader.setCrossOrigin(this.options.crossOrigin), this.fileLoader = new THREE.FileLoader(this.options.manager), this.fileLoader.setResponseType("arraybuffer")
  }

  function H(e, t, a) {
    var r = t.attributes;
    for (var s in r) {
      var i = E[s],
        n = a[r[s]];
      i && (i in e.attributes || e.addAttribute(i, n))
    }
    void 0 === t.indices || e.index || e.setIndex(a[t.indices])
  }
  return S.prototype.parse = function (e, t) {
    var a = this.json;
    this.cache.removeAll(), this.markDefs(), this.getMultiDependencies(["scene", "animation", "camera"]).then(function (t) {
      var r = t.scenes || [],
        s = r[a.scene || 0],
        i = t.animations || [],
        n = a.asset,
        o = t.cameras || [];
      e(s, r, o, i, n)
    }).catch(t)
  }, S.prototype.markDefs = function () {
    for (var e = this.json.nodes || [], t = this.json.skins || [], a = this.json.meshes || [], r = {}, s = {}, i = 0, n = t.length; i < n; i++)
      for (var o = t[i].joints, l = 0, p = o.length; l < p; l++) e[o[l]].isBone = !0;
    for (var u = 0, c = e.length; u < c; u++) {
      var d = e[u];
      void 0 !== d.mesh && (void 0 === r[d.mesh] && (r[d.mesh] = s[d.mesh] = 0), r[d.mesh]++, void 0 !== d.skin && (a[d.mesh].isSkinnedMesh = !0))
    }
    this.json.meshReferences = r, this.json.meshUses = s
  }, S.prototype.getDependency = function (e, t) {
    var a = e + ":" + t,
      r = this.cache.get(a);
    return r || (r = this["load" + e.charAt(0).toUpperCase() + e.slice(1)](t), this.cache.add(a, r)), r
  }, S.prototype.getDependencies = function (e) {
    var t = this.cache.get(e);
    if (!t) {
      var a = this,
        r = this.json[e + ("mesh" === e ? "es" : "s")] || [];
      t = Promise.all(r.map(function (t, r) {
        return a.getDependency(e, r)
      })), this.cache.add(e, t)
    }
    return t
  }, S.prototype.getMultiDependencies = function (e) {
    for (var t = {}, a = [], r = 0, s = e.length; r < s; r++) {
      var i = e[r],
        n = this.getDependencies(i);
      n = n.then(function (e, a) {
        t[e] = a
      }.bind(this, i + ("mesh" === i ? "es" : "s"))), a.push(n)
    }
    return Promise.all(a).then(function () {
      return t
    })
  }, S.prototype.loadBuffer = function (e) {
    var a = this.json.buffers[e],
      r = this.fileLoader;
    if (a.type && "arraybuffer" !== a.type) throw new Error("THREE.GLTFLoader: " + a.type + " buffer type is not supported.");
    if (void 0 === a.uri && 0 === e) return Promise.resolve(this.extensions[t.KHR_BINARY_GLTF].body);
    var s = this.options;
    return new Promise(function (e, t) {
      r.load(v(a.uri, s.path), e, void 0, function () {
        t(new Error('THREE.GLTFLoader: Failed to load buffer "' + a.uri + '".'))
      })
    })
  }, S.prototype.loadBufferView = function (e) {
    var t = this.json.bufferViews[e];
    return this.getDependency("buffer", t.buffer).then(function (e) {
      var a = t.byteLength || 0,
        r = t.byteOffset || 0;
      return e.slice(r, r + a)
    })
  }, S.prototype.loadAccessor = function (e) {
    var t = this,
      a = this.json,
      r = this.json.accessors[e];
    if (void 0 === r.bufferView && void 0 === r.sparse) return null;
    var s = [];
    return void 0 !== r.bufferView ? s.push(this.getDependency("bufferView", r.bufferView)) : s.push(null), void 0 !== r.sparse && (s.push(this.getDependency("bufferView", r.sparse.indices.bufferView)), s.push(this.getDependency("bufferView", r.sparse.values.bufferView))), Promise.all(s).then(function (e) {
      var s, i, n = e[0],
        o = h[r.type],
        p = l[r.componentType],
        u = p.BYTES_PER_ELEMENT,
        c = u * o,
        d = r.byteOffset || 0,
        E = a.bufferViews[r.bufferView].byteStride,
        m = !0 === r.normalized;
      if (E && E !== c) {
        var f = "InterleavedBuffer:" + r.bufferView + ":" + r.componentType,
          v = t.cache.get(f);
        v || (s = new p(n), v = new THREE.InterleavedBuffer(s, E / u), t.cache.add(f, v)), i = new THREE.InterleavedBufferAttribute(v, o, d / u, m)
      } else s = null === n ? new p(r.count * o) : new p(n, d, r.count * o), i = new THREE.BufferAttribute(s, o, m);
      if (void 0 !== r.sparse) {
        var T = h.SCALAR,
          R = l[r.sparse.indices.componentType],
          g = r.sparse.indices.byteOffset || 0,
          M = r.sparse.values.byteOffset || 0,
          S = new R(e[1], g, r.sparse.count * T),
          H = new p(e[2], M, r.sparse.count * o);
        null !== n && i.setArray(i.array.slice());
        for (var y = 0, L = S.length; y < L; y++) {
          var x = S[y];
          if (i.setX(x, H[y * o]), o >= 2 && i.setY(x, H[y * o + 1]), o >= 3 && i.setZ(x, H[y * o + 2]), o >= 4 && i.setW(x, H[y * o + 3]), o >= 5) throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")
        }
      }
      return i
    })
  }, S.prototype.loadTexture = function (e) {
    var t = this.json,
      a = this.options,
      r = this.textureLoader,
      s = window.URL || window.webkitURL,
      i = t.textures[e],
      n = t.images[i.source],
      o = n.uri,
      l = !1;
    return void 0 !== n.bufferView && (o = this.getDependency("bufferView", n.bufferView).then(function (e) {
      l = !0;
      var t = new Blob([e], {
        type: n.mimeType
      });
      return o = s.createObjectURL(t)
    })), Promise.resolve(o).then(function (e) {
      var t = THREE.Loader.Handlers.get(e) || r;
      return new Promise(function (r, s) {
        t.load(v(e, a.path), r, void 0, s)
      })
    }).then(function (e) {
      !0 === l && s.revokeObjectURL(o), e.flipY = !1, void 0 !== i.name && (e.name = i.name), e.format = void 0 !== i.format ? c[i.format] : THREE.RGBAFormat, void 0 !== i.internalFormat && e.format !== c[i.internalFormat] && console.warn("THREE.GLTFLoader: Three.js does not support texture internalFormat which is different from texture format. internalFormat will be forced to be the same value as format."), e.type = void 0 !== i.type ? d[i.type] : THREE.UnsignedByteType;
      var a = (t.samplers || {})[i.sampler] || {};
      return e.magFilter = p[a.magFilter] || THREE.LinearFilter, e.minFilter = p[a.minFilter] || THREE.LinearMipMapLinearFilter, e.wrapS = u[a.wrapS] || THREE.RepeatWrapping, e.wrapT = u[a.wrapT] || THREE.RepeatWrapping, e
    })
  }, S.prototype.assignTexture = function (e, t, a) {
    return this.getDependency("texture", a).then(function (a) {
      e[t] = a
    })
  }, S.prototype.loadMaterial = function (e) {
    this.json;
    var a, r = this.extensions,
      s = this.json.materials[e],
      i = {},
      n = s.extensions || {},
      o = [];
    if (n[t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS]) {
      var l = r[t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS];
      a = l.getMaterialType(s), o.push(l.extendParams(i, s, this))
    } else if (n[t.KHR_MATERIALS_UNLIT]) {
      var p = r[t.KHR_MATERIALS_UNLIT];
      a = p.getMaterialType(s), o.push(p.extendParams(i, s, this))
    } else if (void 0 !== s.pbrMetallicRoughness) {
      a = THREE.MeshStandardMaterial;
      var u = s.pbrMetallicRoughness;
      if (i.color = new THREE.Color(1, 1, 1), i.opacity = 1, Array.isArray(u.baseColorFactor)) {
        var c = u.baseColorFactor;
        i.color.fromArray(c), i.opacity = c[3]
      }
      if (void 0 !== u.baseColorTexture && o.push(this.assignTexture(i, "map", u.baseColorTexture.index)), i.metalness = void 0 !== u.metallicFactor ? u.metallicFactor : 1, i.roughness = void 0 !== u.roughnessFactor ? u.roughnessFactor : 1, void 0 !== u.metallicRoughnessTexture) {
        var d = u.metallicRoughnessTexture.index;
        o.push(this.assignTexture(i, "metalnessMap", d)), o.push(this.assignTexture(i, "roughnessMap", d))
      }
    } else a = THREE.MeshPhongMaterial;
    !0 === s.doubleSided && (i.side = THREE.DoubleSide);
    var h = s.alphaMode || "OPAQUE";
    return "BLEND" === h ? i.transparent = !0 : (i.transparent = !1, "MASK" === h && (i.alphaTest = void 0 !== s.alphaCutoff ? s.alphaCutoff : .5)), void 0 !== s.normalTexture && a !== THREE.MeshBasicMaterial && (o.push(this.assignTexture(i, "normalMap", s.normalTexture.index)), i.normalScale = new THREE.Vector2(1, 1), void 0 !== s.normalTexture.scale && i.normalScale.set(s.normalTexture.scale, s.normalTexture.scale)), void 0 !== s.occlusionTexture && a !== THREE.MeshBasicMaterial && (o.push(this.assignTexture(i, "aoMap", s.occlusionTexture.index)), void 0 !== s.occlusionTexture.strength && (i.aoMapIntensity = s.occlusionTexture.strength)), void 0 !== s.emissiveFactor && a !== THREE.MeshBasicMaterial && (i.emissive = (new THREE.Color).fromArray(s.emissiveFactor)), void 0 !== s.emissiveTexture && a !== THREE.MeshBasicMaterial && o.push(this.assignTexture(i, "emissiveMap", s.emissiveTexture.index)), Promise.all(o).then(function () {
      var e;
      return e = a === THREE.ShaderMaterial ? r[t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].createMaterial(i) : new a(i), void 0 !== s.name && (e.name = s.name), e.normalScale && (e.normalScale.x = -e.normalScale.x), e.map && (e.map.encoding = THREE.sRGBEncoding), e.emissiveMap && (e.emissiveMap.encoding = THREE.sRGBEncoding), s.extras && (e.userData = s.extras), e
    })
  }, S.prototype.loadGeometries = function (e) {
    var a = this,
      r = this.extensions,
      s = this.primitiveCache;
    return this.getDependencies("accessor").then(function (i) {
      for (var n = [], o = [], l = 0, p = e.length; l < p; l++) {
        var u, c = e[l],
          d = g(s, c);
        if (d) o.push(d.then(function (e) {
          n.push(e)
        }));
        else if (c.extensions && c.extensions[t.KHR_DRACO_MESH_COMPRESSION]) {
          var h = r[t.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(c, a).then(function (e) {
            return H(e, c, i), n.push(e), e
          });
          s.push({
            primitive: c,
            promise: h
          }), o.push(h)
        } else H(u = new THREE.BufferGeometry, c, i), s.push({
          primitive: c,
          promise: Promise.resolve(u)
        }), n.push(u)
      }
      return Promise.all(o).then(function () {
        return n
      })
    })
  }, S.prototype.loadMesh = function (e) {
    var a = this,
      r = (this.json, this.extensions),
      s = this.json.meshes[e];
    return this.getMultiDependencies(["accessor", "material"]).then(function (i) {
      var n = new THREE.Group,
        o = s.primitives;
      return a.loadGeometries(o).then(function (l) {
        for (var p = 0, u = o.length; p < u; p++) {
          var c = o[p],
            d = l[p],
            h = void 0 === c.material ? new THREE.MeshStandardMaterial({
              color: 16777215,
              emissive: 0,
              metalness: 1,
              roughness: 1,
              transparent: !1,
              depthTest: !0,
              side: THREE.FrontSide
            }) : i.materials[c.material];
          h.aoMap && void 0 === d.attributes.uv2 && void 0 !== d.attributes.uv && (console.log("THREE.GLTFLoader: Duplicating UVs to support aoMap."), d.addAttribute("uv2", new THREE.BufferAttribute(d.attributes.uv.array, 2)));
          var E, m = void 0 !== d.attributes.color,
            f = void 0 === d.attributes.normal,
            v = !0 === s.isSkinnedMesh,
            R = void 0 !== c.targets;
          if ((m || f || v || R) && (h = h.isGLTFSpecularGlossinessMaterial ? r[t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].cloneMaterial(h) : h.clone()), m && (h.vertexColors = THREE.VertexColors, h.needsUpdate = !0), f && (h.flatShading = !0), 4 === c.mode || 5 === c.mode || 6 === c.mode || void 0 === c.mode) v ? (E = new THREE.SkinnedMesh(d, h), h.skinning = !0) : E = new THREE.Mesh(d, h), 5 === c.mode ? E.drawMode = THREE.TriangleStripDrawMode : 6 === c.mode && (E.drawMode = THREE.TriangleFanDrawMode);
          else if (1 === c.mode || 3 === c.mode || 2 === c.mode) {
            var g = "LineBasicMaterial:" + h.uuid,
              M = a.cache.get(g);
            M || (M = new THREE.LineBasicMaterial, THREE.Material.prototype.copy.call(M, h), M.color.copy(h.color), M.lights = !1, a.cache.add(g, M)), h = M, E = 1 === c.mode ? new THREE.LineSegments(d, h) : 3 === c.mode ? new THREE.Line(d, h) : new THREE.LineLoop(d, h)
          } else {
            if (0 !== c.mode) throw new Error("THREE.GLTFLoader: Primitive mode unsupported: " + c.mode);
            g = "PointsMaterial:" + h.uuid;
            var S = a.cache.get(g);
            S || (S = new THREE.PointsMaterial, THREE.Material.prototype.copy.call(S, h), S.color.copy(h.color), S.map = h.map, S.lights = !1, a.cache.add(g, S)), h = S, E = new THREE.Points(d, h)
          }
          if (E.name = s.name || "mesh_" + e, R && T(E, s, c, i.accessors), void 0 !== s.extras && (E.userData = s.extras), void 0 !== c.extras && (E.geometry.userData = c.extras), !0 === h.isGLTFSpecularGlossinessMaterial && (E.onBeforeRender = r[t.KHR_MATERIALS_PBR_SPECULAR_GLOSSINESS].refreshUniforms), !(o.length > 1)) return E;
          E.name += "_" + p, n.add(E)
        }
        return n
      })
    })
  }, S.prototype.loadCamera = function (e) {
    var t, a = this.json.cameras[e],
      r = a[a.type];
    if (r) {
      if ("perspective" === a.type) {
        var s = r.aspectRatio || 1,
          i = r.yfov * s;
        t = new THREE.PerspectiveCamera(THREE.Math.radToDeg(i), s, r.znear || 1, r.zfar || 2e6)
      } else "orthographic" === a.type && (t = new THREE.OrthographicCamera(r.xmag / -2, r.xmag / 2, r.ymag / 2, r.ymag / -2, r.znear, r.zfar));
      return void 0 !== a.name && (t.name = a.name), a.extras && (t.userData = a.extras), Promise.resolve(t)
    }
    console.warn("THREE.GLTFLoader: Missing camera parameters.")
  }, S.prototype.loadSkin = function (e) {
    var t = this.json.skins[e],
      a = {
        joints: t.joints
      };
    return void 0 === t.inverseBindMatrices ? Promise.resolve(a) : this.getDependency("accessor", t.inverseBindMatrices).then(function (e) {
      return a.inverseBindMatrices = e, a
    })
  }, S.prototype.loadAnimation = function (e) {
    this.json;
    var t = this.json.animations[e];
    return this.getMultiDependencies(["accessor", "node"]).then(function (a) {
      for (var r = [], s = 0, i = t.channels.length; s < i; s++) {
        var n = t.channels[s],
          l = t.samplers[n.sampler];
        if (l) {
          var p = n.target,
            u = void 0 !== p.node ? p.node : p.id,
            c = void 0 !== t.parameters ? t.parameters[l.input] : l.input,
            d = void 0 !== t.parameters ? t.parameters[l.output] : l.output,
            h = a.accessors[c],
            E = a.accessors[d],
            v = a.nodes[u];
          if (v) {
            var T;
            switch (v.updateMatrix(), v.matrixAutoUpdate = !0, m[p.path]) {
              case m.weights:
                T = THREE.NumberKeyframeTrack;
                break;
              case m.rotation:
                T = THREE.QuaternionKeyframeTrack;
                break;
              case m.position:
              case m.scale:
              default:
                T = THREE.VectorKeyframeTrack
            }
            var R = v.name ? v.name : v.uuid,
              g = void 0 !== l.interpolation ? f[l.interpolation] : THREE.InterpolateLinear,
              M = [];
            m[p.path] === m.weights ? v.traverse(function (e) {
              !0 === e.isMesh && !0 === e.material.morphTargets && M.push(e.name ? e.name : e.uuid)
            }) : M.push(R);
            for (var S = 0, H = M.length; S < H; S++) {
              var y = new T(M[S] + "." + m[p.path], THREE.AnimationUtils.arraySlice(h.array, 0), THREE.AnimationUtils.arraySlice(E.array, 0), g);
              "CUBICSPLINE" === l.interpolation && (y.createInterpolant = function (e) {
                return new o(this.times, this.values, this.getValueSize() / 3, e)
              }, y.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline = !0), r.push(y)
            }
          }
        }
      }
      return u = void 0 !== t.name ? t.name : "animation_" + e, new THREE.AnimationClip(u, void 0, r)
    })
  }, S.prototype.loadNode = function (e) {
    this.json;
    var a = this.extensions,
      r = this.json.meshReferences,
      s = this.json.meshUses,
      i = this.json.nodes[e];
    return this.getMultiDependencies(["mesh", "skin", "camera"]).then(function (e) {
      var n;
      if (!0 === i.isBone) n = new THREE.Bone;
      else if (void 0 !== i.mesh) {
        var o = e.meshes[i.mesh];
        if (n = o.clone(), !0 === o.isGroup)
          for (var l = 0, p = o.children.length; l < p; l++) {
            var u = o.children[l];
            u.material && !0 === u.material.isGLTFSpecularGlossinessMaterial && (n.children[l].onBeforeRender = u.onBeforeRender)
          } else o.material && !0 === o.material.isGLTFSpecularGlossinessMaterial && (n.onBeforeRender = o.onBeforeRender);
        r[i.mesh] > 1 && (n.name += "_instance_" + s[i.mesh]++)
      } else n = void 0 !== i.camera ? e.cameras[i.camera] : i.extensions && i.extensions[t.KHR_LIGHTS] && void 0 !== i.extensions[t.KHR_LIGHTS].light ? a[t.KHR_LIGHTS].lights[i.extensions[t.KHR_LIGHTS].light] : new THREE.Object3D;
      if (void 0 !== i.name && (n.name = THREE.PropertyBinding.sanitizeNodeName(i.name)), i.extras && (n.userData = i.extras), void 0 !== i.matrix) {
        var c = new THREE.Matrix4;
        c.fromArray(i.matrix), n.applyMatrix(c)
      } else void 0 !== i.translation && n.position.fromArray(i.translation), void 0 !== i.rotation && n.quaternion.fromArray(i.rotation), void 0 !== i.scale && n.scale.fromArray(i.scale);
      return n
    })
  }, S.prototype.loadScene = function () {
    function e(t, a, r, s, i) {
      var n = s[t],
        o = r.nodes[t];
      if (void 0 !== o.skin)
        for (var l = !0 === n.isGroup ? n.children : [n], p = 0, u = l.length; p < u; p++) {
          for (var c = l[p], d = i[o.skin], h = [], E = [], m = 0, f = d.joints.length; m < f; m++) {
            var v = d.joints[m],
              T = s[v];
            if (T) {
              h.push(T);
              var R = new THREE.Matrix4;
              void 0 !== d.inverseBindMatrices && R.fromArray(d.inverseBindMatrices.array, 16 * m), E.push(R)
            } else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.', v)
          }
          c.bind(new THREE.Skeleton(h, E), c.matrixWorld)
        }
      if (a.add(n), o.children) {
        var g = o.children;
        for (p = 0, u = g.length; p < u; p++) e(g[p], n, r, s, i)
      }
    }
    return function (a) {
      var r = this.json,
        s = this.extensions,
        i = this.json.scenes[a];
      return this.getMultiDependencies(["node", "skin"]).then(function (a) {
        var n = new THREE.Scene;
        void 0 !== i.name && (n.name = i.name), i.extras && (n.userData = i.extras);
        for (var o = i.nodes || [], l = 0, p = o.length; l < p; l++) e(o[l], n, r, a.nodes, a.skins);
        if (i.extensions && i.extensions[t.KHR_LIGHTS] && void 0 !== i.extensions[t.KHR_LIGHTS].light) {
          var u = s[t.KHR_LIGHTS].lights;
          n.add(u[i.extensions[t.KHR_LIGHTS].light])
        }
        return n
      })
    }
  }(), e
}();