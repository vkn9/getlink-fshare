const btnCopy = document.getElementById('btn-copy');
const linkMaxspeed = document.getElementById('link-maxspeed');
const linkFS = document.getElementById('link-fshare');
const playerVideo = document.getElementById('video-online');
const player = new Plyr('#player');

const btnXuLy = document.getElementById('btn-xu-ly');

btnXuLy.addEventListener('click', () => {
  const radios = document.getElementsByName('typeget');
  for (var i = 0, length = radios.length; i < length; i++) {
    if (radios[i].checked) {
      const value = radios[i].value;
      const link = linkFS.value;
      axios
        .post(
          '/',
          {
            link
          },
          {
            headers: {
              'Content-Type': 'application/json'
            }
          }
        )
        .then(function(response) {
          const data = response.data;
          if (data.getlink && data.getlink === 'done') {
            switch (value) {
              case 'getlink':
                playerVideo.style.display = 'none';
                linkMaxspeed.style.display = 'block';
                linkMaxspeed.value = data.link;
                break;

              case 'xemonline':
                linkMaxspeed.style.display = 'none';
                playerVideo.style.display = 'block';
                player.source = {
                  type: 'video',
                  sources: [
                    {
                      src: data.link,
                      type: 'video/mp4'
                    }
                  ]
                };
                break;
            }
          } else {
            alert(JSON.stringify(data));
          }
        })
        .catch(function(error) {
          console.log(error);
        });
    }
  }
});
