class AttributePointer{
    constructor(location, size, type, normalized, stride, offset){
        this.location = location;
        this.size = size;
        this.type = type;
        this.normalized = normalized;
        this.stride = stride;
        this.offset = offset;
    }
}

class Vertex{
    constructor(vertex, color){
        this.pos = vertex || [0.0, 0.0, 0.0];
        this.color = color || [1.0, 1.0, 1.0, 1.0];
    }
    toArray(){
        let result = this.pos.concat(this.color);
        return result;
    }
}

class VertexArray{
    constructor(vertices, layout){
        this.vertices = vertices;
        this.array = this._toSingleArray();
        this.count = vertices.length;
        this.layout = layout;
    }

    _toSingleArray(){
        let result = [];
        for(let vertex of this.vertices){
            let v = vertex.toArray();
            result = result.concat(v);
        }
        return new Float32Array(result);
    }
}

class Mesh{
    constructor(vertexArray, indices, usage){
        this.vertices = vertexArray;
        //    [ new AttribPointer(0, 3, gl.FLOAT, false, this.vertices.count * Float32Array.BYTES_PER_ELEMENT, 0) ];
        this.indices = indices;
        this.isIndexed = indices ? true : false;
        this.usage = usage || gl.STATIC_DRAW;
        this.binded = false;
        this._initBuffers();
    }

    render(mode){
        this.bind();
        if(this.isIndexed){
            gl.drawElements(mode, this.indices.length, gl.UNSIGNED_SHORT, 0);
        }else{
            gl.drawArrays(mode, 0, this.vertices.count);
        }
        this.unbind();
    }

    bind(){
        if(!this.binded){
            gl.bindVertexArray(this.buffers.VAO);
            this.binded = true;    
        }
    }

    unbind(){
        if(this.binded){
            gl.bindVertexArray(null);
            this.binded = false;
        }
    }

    _initBuffers(){
        this.buffers = {};
        // VAO = Vertex array buffer
        // VBO = Vertex buffer object
        // EBO = Element buffer object (indices)
        this.buffers.VAO = gl.createVertexArray();
        this.buffers.VBO = gl.createBuffer();
        this.buffers.EBO = this.isIndexed ? gl.createBuffer() : undefined;
        gl.bindVertexArray(this.buffers.VAO);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers.VBO);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertices.array, this.usage);
        if(this.isIndexed){
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffers.EBO);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.usage);
        }
        for(let iter of this.vertices.layout){
            let attr = iter.attribute;
            gl.vertexAttribPointer(
                attr.location, // Attribute location
                attr.size, // Number of elements per attribute
                attr.type, // Type of element
                attr.normalized, // Normalized
                attr.stride, // Size of an individual vertex
                attr.offset // Offset from the begining of a  single vertex to this attribute
            );
            gl.enableVertexAttribArray(attr.location);
        }
        gl.bindVertexArray(null);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
    }
}