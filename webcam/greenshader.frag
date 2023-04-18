precision mediump float;

// lets grab texcoords just for fun
varying vec2 vTexCoord;
// our texture coming from p5
uniform sampler2D tex0;

vec3 rgb2hsb(vec3 c){
    vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
    vec4 p = c.g < c.b ? vec4(c.bg, K.wz) : vec4(c.gb, K.xy);
    vec4 q = c.r < p.x ? vec4(p.xyw, c.r) : vec4(c.r, p.yzx);

    float d = q.x - min(q.w, q.y);
    float e = 1.0e-10;
    return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
}

vec3 hsb2rgb(vec3 c){
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}


void main() {

    vec2 uv = vTexCoord;
    // the texture is loaded upside down and backwards by default so lets flip it
    uv = 1.0 - uv;

    // get the webcam as a vec4 using texture2D
    vec4 tex = texture2D(tex0, uv);

    //convert to HSB
    vec3 hsb = rgb2hsb(tex.rgb);

    // here we will use the step function to convert the image into black or white
    // any color less than mouseX will become black, any color greater than mouseX will become white

    if (hsb.r > 0.5 && hsb.r < 0.75 && hsb.g > 0.25 && hsb.b < 0.75) {

        vec4 blueDetect = vec4(tex.r, tex.g, tex.b, 1.0);

        gl_FragColor = blueDetect;

    } else {

        gl_FragColor = vec4(tex.r, tex.r, tex.r, 1.0);

    }

}