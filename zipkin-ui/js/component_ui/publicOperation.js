export function initialServiceColor (){
  let nodes = document.getElementsByClassName('node enter');
  for (let i = 0; i < nodes.length; i++) {
    let node = nodes[i].getElementsByTagName('rect')[0];
    node.setAttribute('fill', '#FFF');
  }
}

export function isInArray(arr, value) {
  for (let i = 0; i < arr.length; i++) {
    if (value === arr[i]) {
      return true;
    }
  }
  return false;
}
