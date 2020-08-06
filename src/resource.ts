
import { Scene2D } from "./scene/scene2d.js";
import { Object2D, PathObject2D } from "./scene/object2d.js";

export class Resource {
  response: Response = undefined;
  uri: string;

  static load(uri: string, premadeResource?: Resource): Promise<Resource> {
    return new Promise(async (resolve, reject) => {
      let result: Resource;
      if (premadeResource) {
        result = premadeResource;
      } else {
        result = new Resource();
      }
      result.uri = uri;
      result.response = await fetch(uri);
      resolve(result);
    });
  }
}

export class TextResource extends Resource {
  text: string;

  static load (uri: string, premadeResource?: TextResource): Promise<TextResource> {
    return new Promise(async(resolve, reject)=>{
      let result: TextResource;
      if (premadeResource) {
        result = premadeResource;
      } else {
        result = new TextResource();
      }
      result = await Resource.load(uri, result) as TextResource;

      result.text = await result.response.text();

      resolve(result);
    });
  }
}

export class XmlResource extends TextResource {
  static DOM_PARSER: DOMParser = new DOMParser();
  xml: Document;

  static load (uri: string, premadeResource?: XmlResource, type: SupportedType = "text/xml"): Promise<XmlResource> {
    return new Promise(async(resolve, reject)=>{
      let result: XmlResource;
      if (premadeResource) {
        result = premadeResource;
      } else {
        result = new XmlResource();
      }
      result = await TextResource.load(uri, result) as XmlResource;

      result.xml = XmlResource.DOM_PARSER.parseFromString(result.text, type);

      resolve(result);
    });
  }
}

export interface DOMMatrixDecomp {
  translateX: number,
  translateY: number,
  rotate: number,
  scaleX: number,
  scaleY: number,
  skew: number
}

export class SceneResource extends XmlResource {
  scene: Scene2D;

  constructor() {
    super();
  }
  //https://stackoverflow.com/a/60592373
  static decomposeDomMatrix(m: DOMMatrix): DOMMatrixDecomp {
    let E = (m.a + m.d) / 2
    let F = (m.a - m.d) / 2
    let G = (m.c + m.b) / 2
    let H = (m.c - m.b) / 2
  
    let Q = Math.sqrt(E * E + H * H);
    let R = Math.sqrt(F * F + G * G);
    let a1 = Math.atan2(G, F);
    let a2 = Math.atan2(H, E);
    let theta = (a2 - a1) / 2;
    let phi = (a2 + a1) / 2;
  
    // The requested parameters are then theta, 
    // sx, sy, phi,
    return {
      translateX: m.e,
      translateY: m.f,
      rotate: -phi * 180 / Math.PI,
      scaleX: Q + R,
      scaleY: Q - R,
      skew: -theta * 180 / Math.PI
    };
  }
  static copySvgGroupTransToObject2D (node: SVGGElement, obj: Object2D) {
    if (node.transform.baseVal.numberOfItems < 1) return;

    let decomp = SceneResource.decomposeDomMatrix(
      node.transform.baseVal.getItem(0).matrix
    );

    obj.transform.position.set(
      decomp.translateX,
      decomp.translateY
    );
    obj.transform.rotation = decomp.rotate;
    obj.transform.scale = decomp.scaleX;
  }
  static parseSvgGroup (node: SVGGElement): Object2D {
    let result: Object2D = new Object2D();
    SceneResource.copySvgGroupTransToObject2D(node, result);

    for (let child of node.children) {
      if (child instanceof SVGGElement) {
        result.add(SceneResource.parseSvgGroup(child));
      }
      if (child instanceof SVGPathElement) {
        result.add(SceneResource.parseSvgPath(child));
      }
    }

    return result;
  }
  static parseSvgPath (node: SVGPathElement): PathObject2D {
    let result: PathObject2D = new PathObject2D();
    SceneResource.copySvgGroupTransToObject2D(node, result);

    let dPath = node.getAttribute("d");
    console.log(dPath);

    let path: Path2D;
    if (dPath) {
      path = new Path2D(dPath);
    } else {
      path = new Path2D();
      console.warn("Warning, path had no 'd' attribute. Empty Path2D", path);
    }
    result.setPath(path);

    return result;
  }
  static load (uri: string, premadeResource?: SceneResource, type: SupportedType = "image/svg+xml"): Promise<SceneResource> {
    return new Promise(async(resolve, reject)=>{
      let result: SceneResource;
      if (premadeResource) {
        result = premadeResource;
      } else {
        result = new SceneResource();
      }
      result = await XmlResource.load(uri, result) as SceneResource;
      
      result.scene = new Scene2D();

      let child: Element;
      let firstSvg: SVGElement;
      for (let i=0; i<result.xml.children.length; i++) {
        child = result.xml.children[i];
        if (child instanceof SVGElement) {
          firstSvg = child;
          break;
        }
      }

      if (!firstSvg) console.warn("Not svg element found in document! Scene imported is empty");

      let obj: Object2D;
      for (let child of firstSvg.children) {
        if (child instanceof SVGGElement) {
          obj = SceneResource.parseSvgGroup(child);

          result.scene.add(obj);
        }
        if (child instanceof SVGPathElement) {
          obj = SceneResource.parseSvgPath(child);

          result.scene.add(obj);
        }
      }

      resolve(result);
    });
  }
}

