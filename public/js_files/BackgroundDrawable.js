"use strict";

var GK = GK || {};
GK.BackgroundDrawable = function () {
    var vertex = `
        precision highp float;

        attribute vec3 aPosition;
        attribute vec3 aNormal;
        attribute vec2 aTexture;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;
        uniform vec3 uLightDir;

        varying vec2 vTexture;
        varying float vLightWeight;

        void main(void) {
            vec4 mvPosition = uMVMatrix * vec4(aPosition, 1.0);
            gl_Position = uPMatrix * mvPosition;

            vec3 transformedNormal = normalize(mat3(uMVMatrix) * aNormal);
            vec3 lightDirection = normalize(uLightDir - mvPosition.xyz);
            vLightWeight = max(dot(transformedNormal, lightDirection), 0.955);

            vTexture = aTexture;
        }
    `;

    var fragment = `
        precision highp float;

        varying vec2 vTexture;
        varying float vLightWeight;
        uniform sampler2D uSampler;
        uniform float uAlpha;

        void main(void) {
            vec4 textureColor = texture2D(uSampler, vTexture);
            gl_FragColor = vec4(textureColor.rgb * vLightWeight, textureColor.a * uAlpha);
        }
    `;

    var self = this;

    // WebGL
    var texture1;
    var texture2;
    var texture3;
    var vertexBuffer;
    var indexBuffer;
    var vertexCount;
    var indexCount;

    var lightOrigin = vec3.fromValues(0.0, 0.0, 0.0);
    this.lightDir = vec3.fromValues(0.0, 0.0, 1.0);
    this.alpha = 0.95;

    this.modelMatrix = mat4.create();
    mat4.identity(this.modelMatrix);

    var texture = null;

    this.init = function () {
        this.program = GK.ProgramManager.create(vertex, fragment);
        texture1 = GK.TextureManager.loadTexture(imgData1, true, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
        texture2 = GK.TextureManager.loadTexture(imgData2, true, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
        texture3 = GK.TextureManager.loadTexture(imgData3, true, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
        return this;
    }

    this.loadModel = function (model) {
        var vertices = model.vertices;
        var indices = model.indices;

        vertexCount = vertices.length;
        indexCount = indices.length;

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
    }

    this.draw = function (camera, time) {
        if (!texture1.loaded || !texture2.loaded || !texture3.loaded) return;
        gl.useProgram(this.program.name);

        this.lightDir = vec3.fromValues(-3.0, Math.sin(time * 0.001) * 2.0, Math.cos(time * 0.0008) * 4.0);

        gl.uniformMatrix4fv(this.program.uniforms.uPMatrix, false, camera.perspectiveMatrix);

        // if(Site.isMobile && Site.isCollapse){
            // const model=[100000, 0, 0, 0, 0, 1.28, 0, 0, 0, 0, 1, 0, 0, 0, -15, 1]      
            // gl.uniformMatrix4fv(this.program.uniforms.uMVMatrix, false, model);
        // } else
        gl.uniformMatrix4fv(this.program.uniforms.uMVMatrix, false, this.modelMatrix);

        gl.uniform3fv(this.program.uniforms.uLightDir, this.lightDir);
        gl.uniform1f(this.program.uniforms.uAlpha, this.alpha);

        gl.activeTexture(gl.TEXTURE0);
        // if(Site.isMobile && Site.isCollapse)
            // gl.bindTexture(gl.TEXTURE_2D, texture2);
        // else if(Site.isMobile && !Site.isCollapse)
            // gl.bindTexture(gl.TEXTURE_2D, texture3);
        // else
            gl.bindTexture(gl.TEXTURE_2D, texture1);

        gl.uniform1i(this.program.uniforms.uSampler, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        gl.vertexAttribPointer(this.program.attributes.aPosition, 3, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(this.program.attributes.aNormal, 3, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(this.program.attributes.aTexture, 2, gl.FLOAT, false, 32, 24);

        gl.enableVertexAttribArray(this.program.attributes.aPosition);
        gl.enableVertexAttribArray(this.program.attributes.aNormal);
        gl.enableVertexAttribArray(this.program.attributes.aTexture);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.drawElements(gl.TRIANGLES, indexCount, gl.UNSIGNED_SHORT, 0);
    }
}

