(function () {
    'use strict';
    // when resize
    var winResize = new THREEx.WindowResize(DT.renderer, DT.camera),
        dieCoord = DT.param.dieCoord,
        lens,
        emitter,
        fragmentsPosition = {x: -1000, y: 0, z: 0},
        fragmentsCounter = 0;

    // DT.renderer
    DT.renderer.setSize(window.innerWidth, window.innerHeight);
    DT.renderer.physicallyBasedShading = true;
    document.body.appendChild(DT.renderer.domElement);

    // DT.camera
    DT.camera.position.set(0, 0.5, 15);
    DT.camera.position.z = DT.camera.z = 15;
    lens = DT.camera.lens = 35;

    // DT.sphere
    DT.sphere.position.set(0, -2.5, 0);

    // DT.lights
    DT.lights.light.position.set(0, 0, -1);
    DT.scene.add(DT.lights.light);

    DT.lights.sphereLight.position.set(0, 0, 0);
    DT.scene.add(DT.lights.sphereLight);

    DT.lights.directionalLight.position.set(0, 0, 1);
    DT.scene.add(DT.lights.directionalLight);

    // DT.dust
    DT.dust.createAndAdd();

    // create the emitter for sphere tail
    emitter = Fireworks.createEmitter({nParticles : 100})
        .effectsStackBuilder()
            .spawnerSteadyRate(25)
            .position(Fireworks.createShapePoint(0, 0, 0))
            .velocity(Fireworks.createShapePoint(0, 0, 2))
            .lifeTime(0.7, 0.7)
            .randomVelocityDrift(Fireworks.createVector(0, 0, 0))
            .renderToThreejsParticleSystem({
                particleSystem  : function(emitter){
                    var i,
                        geometry    = new THREE.Geometry(),
                        texture = Fireworks.ProceduralTextures.buildTexture(),
                        material    = new THREE.ParticleBasicMaterial({
                            color       : new THREE.Color().setHSL(1, 0, 0.3).getHex(),
                            size        : 100,
                            sizeAttenuation : false,
                            vertexColors    : true,
                            map     : texture,
                            blending    : THREE.AdditiveBlending,
                            depthWrite  : false,
                            transparent : true
                        }),
                        particleSystem = new THREE.ParticleSystem(geometry, material);
                        particleSystem.dynamic  = true;
                        particleSystem.sortParticles = true;
                    // init vertices
                    for(i = 0; i < emitter.nParticles(); i++){
                        geometry.vertices.push( new THREE.Vector3() );
                    }
                    // init colors
                    geometry.colors = new Array(emitter.nParticles());
                    for(i = 0; i < emitter.nParticles(); i++){
                        geometry.colors[i]  = DT.sphere.material.color;
                    }
                    
                    DT.scene.add(particleSystem);
                    particleSystem.position = DT.sphere.position;
                    return particleSystem;
                }
            }).back()
        .start();
    // DT.emittFragments = Fireworks.createEmitter({nParticles : 1000})
    //     .effectsStackBuilder()
    //         .spawnerSteadyRate(10000)
    //         .position(Fireworks.createShapeSphere(10, 0, 0, 3.0))
    //         .velocity(Fireworks.createShapePoint(0, 0, 10))
    //         .lifeTime(0.3, 0.5)
    //         .randomVelocityDrift(Fireworks.createVector(10, 10, 10))
    //         .renderToThreejsParticleSystem({
    //             particleSystem  : function(emitt){
    //                 var geometry    = new THREE.Geometry(),
    //                     texture = Fireworks.ProceduralTextures.buildTexture(),
    //                     material    = new THREE.ParticleBasicMaterial({
    //                         color       : new THREE.Color().setHSL(1, 0, 0.3).getHex(),
    //                         size        : 4,
    //                         sizeAttenuation : false,
    //                         vertexColors    : true,
    //                         map     : texture,
    //                         blending    : THREE.AdditiveBlending,
    //                         depthWrite  : false,
    //                         transparent : true
    //                     }),
    //                     particleSystem = new THREE.ParticleSystem(geometry, material);
    //                     particleSystem.dynamic  = true;
    //                     particleSystem.sortParticles = true;
    //                 // init vertices
    //                 for( var i = 0; i < emitt.nParticles(); i++ ){
    //                     geometry.vertices.push( new THREE.Vector3() );
    //                 }
    //                 // init colors
    //                 geometry.colors = new Array(emitt.nParticles())
    //                 for( var i = 0; i < emitt.nParticles(); i++ ){
    //                     geometry.colors[i]  = new THREE.Color("green");
    //                 }
    //                 DT.scene.add(particleSystem);
    //                 particleSystem.position = {x:0, y:0, z:0};
    //                 return particleSystem;
    //             }
    //         }).back()
    //     .start();
    $(function() {
        $(window).focus(function() {
            if (!DT.wasMuted) {
                DT.setVolume(1);
            }
        });
        $(window).blur(function() {
            if (DT.gameWasStarted && !DT.gameWasPaused && !DT.gameWasOver) {
                DT.handlers.pause();
            }
            DT.setVolume(0);
        });
    });
    // EFFECT PARALLAX
    // var effect = new THREE.ParallaxBarrierEffect( DT.renderer );
    var effect = new THREE.AnaglyphEffect( DT.renderer );
    //////////////////////////////////////////////
    // ON RENDER 
    //////////////////////////////////////////////
    // EMITTER Particle system - sphere tail
    DT.onRenderFcts.push(function() {
        emitter._particles.forEach(function(el) {
            el.velocity.vector.z += DT.audio.valueAudio/28;
        });
    });
    // FRAGMENTS
    // DT.onRenderFcts.push(function() {
    //     if (fragmentsPosition.x !== -1000) {
    //         fragmentsCounter += 1; 
    //         if (fragmentsCounter > 20) {
    //             fragmentsPosition = {x: -1000, y: 0, z: 0};
    //             fragmentsCounter = 0;
    //         }
    //     }
    //     DT.emittFragments._effects.forEach(function (el) {
    //         if (el.name === "position") {
    //             el.opts.shape.position = fragmentsPosition;
    //             el.opts.shape.radius = 0.15 * fragmentsCounter;
    //         }
    //     });
    // });
    var prevTime = Date.now();
    // render the scene
    DT.onRenderFcts.push(function(delta, now) {
        DT.renderer.render(DT.scene, DT.camera);
        if (DT.player.isFun) {
            effect.render(DT.scene, DT.camera);
            effect.setSize( window.innerWidth, window.innerHeight );
        }
        DT.backgroundMesh.visible = true; // 1 раз
        emitter.update(delta).render();
        // DT.emittFragments.update(delta).render();
        DT.stats.update();
        DT.stats2.update();
        DT.speed.increase();
        if ( DT.animation ) {
            var time = Date.now();
            DT.animation.update( time - prevTime );
            prevTime = time;
        }
    });
    // game timer
    DT.gameTimer = 0;
    DT.onRenderFcts.push(function () {
        DT.gameTimer += 1;
        if (DT.gameTimer % 60 === 0) {
            DT.updateGameTimer(DT.gameTimer);
        }
    });
    // LENS
    DT.onRenderFcts.push(function() {
        var camOffset = 6, camDelta = 0.1,
            lensOffset = 18, lensDelta = 0.3;
        // var composer = DT.composer;
        if (DT.speed.getChanger() > 0) {
            DT.camera.position.z = Math.max(DT.camera.position.z -= camDelta, DT.camera.z - camOffset);
            lens = Math.max(lens -= lensDelta, DT.camera.lens - lensOffset);
            // composer.render();
        } else if (DT.speed.getChanger() < 0) {
            DT.camera.position.z = Math.min(DT.camera.position.z += camDelta, DT.camera.z + camOffset);
            lens = Math.min(lens += lensDelta, DT.camera.lens + lensOffset);
            // composer.render();
        } else {
            var delta = DT.camera.lens - lens;
            if (delta < 0) {
                
                DT.camera.position.z = Math.max(DT.camera.position.z -= camDelta, DT.camera.z);
                lens = Math.max(lens -= lensDelta, DT.camera.lens);
            } else {
                
                DT.camera.position.z = Math.min(DT.camera.position.z += camDelta, DT.camera.z);
                lens = Math.min(lens += lensDelta, DT.camera.lens);
            }
        }
        DT.camera.setLens(lens);
    });
    // stones lifecicle, rotation and moving
    DT.onRenderFcts.push(function() {
        new DT.Stone({
            spawnCoord: DT.param.spawnCoord,
            collection: DT.collections.stones
        });
        DT.collections.stones.forEach(function (el, ind, arr) {
            el.update({
                dieCoord: dieCoord,
                sphere: DT.sphere
            });
        });
    });
    // // fragments lifecicle
    // DT.onRenderFcts.push(function() {
        // fragments = DT.collections.fragments;
    //     if (fragments.length) {
    //         fragments.forEach(function(el, ind, arr) {
    //             el.frames += 1;
    //             el.position.x *= 1.2;
    //             el.position.y *= 1.2;
    //             el.position.z += 0;
    //             if (el.frames > el.TTL) {
    //                 DT.scene.remove(el);
    //                 arr.splice(ind, 1);
    //             }
    //         });
    //     }
    // });
    // coins lifecicle
    DT.onRenderFcts.push(function() {
        var coins = DT.collections.coins;
        if (!coins.length) {
            var x = DT.genCoord(),
                y = -2.5;
            for (var i = 0; i < 10; i++) {
                DT.genCoins(DT.scene, coins, DT.param.spawnCoord - i * 10, x, y, i * 0.25);
            }
        }
        if (coins.length) {
            coins.forEach(function(el, ind, arr) {
                el.rotation.z += 0.05;
                el.position.z += DT.speed.getValue();
                if (el.position.z > dieCoord) {
                    DT.scene.remove(el);
                    arr.splice(ind, 1);
                }
                if (el.position.z > DT.param.opacityCoord) {
                    el.children.forEach(function(el) {
                        el.material.transparent = true;
                        el.material.opacity = 0.5;
                    });
                }
                var distanceBerweenCenters = el.position.distanceTo(DT.sphere.position);
                if (distanceBerweenCenters < 0.9) {
                    DT.audio.sounds.catchCoin.play();
                    DT.sendSocketMessage({
                        type: 'vibr',
                        time: 10
                    });
                    DT.blink.doBlink(0xcfb53b, 60);
                    DT.bump();
                    DT.scene.remove(el);
                    arr.splice(ind, 1);
                    DT.player.changeScore(1);
                }
            });
        }
    });
    // bonuses lifecicle
    DT.onRenderFcts.push(function() {
        var bonuses = DT.collections.bonuses;
        if (!bonuses.length) {
            var x = DT.genCoord(),
                y = -2.5;
            DT.genBonus(DT.scene, bonuses, DT.param.spawnCoord, x, y, DT.listOfModels);
        }
        if (bonuses.length) {
            bonuses.forEach(function(el, ind, arr) {
    
                if (el.type === 0) {
                    el.rotation.z += 0.05;
                }
                if (el.type === 1) {
                    el.rotation.z += 0.05;
                }
                if (el.type === 2) {
                    // el.rotation.y += 0.05;
                }
                el.position.z += DT.speed.getValue();
                if (el.position.z > dieCoord) {
                    DT.scene.remove(el);
                    arr.splice(ind, 1);
                }
                if (el.position.z > DT.param.opacityCoord) {
                    el.material = new THREE.MeshLambertMaterial({shading: THREE.FlatShading, transparent: true, opacity: 0.5});
                }
                if (DT.getDistance(
                    el.position.x, el.position.y, el.position.z,
                    DT.sphere.position.x, DT.sphere.position.y, DT.sphere.position.z) < 1.0) {
                    
                    if (el.type === 0) {
                        el.rotation.x += 0.2;
                    }
                    if (el.type === 1) {
                        el.rotation.y += 0.2;
                    }
                    if (el.type === 2) {
                        // el.rotation.z += 0.2;
                    }
    
                    el.scale.x *= 0.9;
                    el.scale.y *= 0.9;
                    el.scale.z *= 0.9;
    
                    if (DT.getDistance(
                        el.position.x, el.position.y, el.position.z,
                        DT.sphere.position.x, DT.sphere.position.y, DT.sphere.position.z) < 0.9) {
                        
                        DT.scene.remove(el);
                        arr.splice(ind, 1);
                        DT.catchBonus(el.type);
                    }
                }
            });
        }
    });

    // sphere moving
    DT.onRenderFcts.push(function() {
        DT.moveSphere(DT.sphere, DT.player.destPoint, 3);
        DT.lights.sphereLight.position.x = DT.sphere.position.x;
        DT.lights.sphereLight.position.y = DT.sphere.position.y;
    });
    // PLAYER
    DT.onRenderFcts.push(function () {
        DT.player.update();
    });
    // BLINK
    DT.onRenderFcts.push(function() {
        DT.blink.update();
    });
    // DUST
    DT.onRenderFcts.push(function () {
        DT.dust.update({
            material: {
                isFun: DT.player.isFun,
                valueAudio: DT.audio.valueAudio,
                color: DT.sphere.material.color
            }, 
            geometry: {
                speed: DT.speed.getValue()
            }
        });
    });
    
    // JUMP
    // DT.onRenderFcts.push(function () {
    //     if (DT.jumpLength !== 0 || DT.player.jump) {
    //         if (DT.jumpLength < 2 * DT.jumpOffset && !DT.player.jump) {
    //             DT.jumpLength = 2 * 2 * DT.jumpOffset - DT.jumpLength;
    //         }
    //         DT.jumpLength += (DT.speed.getValue() / 6);
    //         DT.sphere.position.y = -(0.5 * DT.jumpLength-DT.jumpOffset)*(0.5 * DT.jumpLength-DT.jumpOffset) + 2.5;
    //         if (DT.sphere.position.y < -2.5) {
    //             DT.player.jump = false;
    //             DT.jumpLength = 0;
    //         }
    //     }
    // });
    
    }());
    DT.snapshot = $.extend(true, {}, DT);