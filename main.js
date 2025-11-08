export default function page() {
    var updatingStatus = false;

 // Observable state for other tabs (e.g. settings) to subscribe to
    function createObservable(initial) {
        let data = Object.assign({}, initial);
        const subs = new Set();
        return {
            get() { return Object.assign({}, data); },
            set(partial) {
                data = Object.assign({}, data, partial);
                subs.forEach(cb => cb(Object.assign({}, data)));
            },
            subscribe(cb) {
                subs.add(cb);
                cb(Object.assign({}, data));
                return () => subs.delete(cb);
            }
        };
    }

    // Expose global observable so settings tab code can consume it:
    window.appState = createObservable({
        stepperPos: 0,
        stepperDesiredPos: 0,
        encoderPosition: 0,
        Kp: 0,
        Ki: 0,
        Kd: 0,
        ip: '',
        ver: ''
    });

    $(document).ready(function () {
        $(".tabsBar div").click(function (x) {
            var src = $(x.currentTarget);
            var tabName = src.attr("id");

            $(".tabContent:not(." + tabName + ")").hide();
            $(".tabContent." + tabName).show();
            $(".tabsBar div:not(." + tabName + ")").removeClass("active");
            src.addClass("active");

        })

    });



    function updateStatus() {
        if (updatingStatus) {
            return;
        }
        $("#status").show();
        fetch('http://esp32dev.local/status', { 
            method: 'GET', 
            mode: 'cors', 
            credentials: 'omit', 
            headers: { 
                'Content-Type': 'application/json'                
            }
        })
            .then(r => r.json()).then(data => {
                document.getElementById('status').innerHTML =
                    'Stepper Pos: ' + data.stepperPos + '<br>' +
                    'Stepper Desired Pos: ' + data.stepperDesiredPos + '<br>' +
                    'Encoder Position: ' + data.encoderPosition + '<br>' +
                    'Encoder Desired Position: ' + data.encoderDesiredPosition + '<br>' +
                    'Kp: ' + data.Kp + '<br>' +
                    'Ki: ' + data.Ki + '<br>' +
                    'Kd: ' + data.Kd + '<br>' +
                    'IP: ' + data.ip + '<br>' +
                    'Ver: ' + data.ver;

                    // update observable state for other tabs (settings)
                if (window.appState && typeof window.appState.set === 'function') {
                    window.appState.set({
                        stepperPos: data.stepperPos,
                        stepperDesiredPos: data.stepperDesiredPos,
                        encoderPosition: data.encoderPosition,
                        Kp: data.Kp,
                        Ki: data.Ki,
                        Kd: data.Kd,
                        ip: data.ip,
                        ver: data.ver
                    });
                }
                updatingStatus = false;
                //$("#status").hide();
            }, () => {
                updatingStatus = false;
                $("#status").hide();
            });
        updatingStatus = true;
    }
    setInterval(updateStatus, 5000);
    updateStatus();



     (function () {
    const kpInput = document.getElementById('kpInput');
    const kiInput = document.getElementById('kiInput');
    const kdInput = document.getElementById('kdInput');
    const saveBtn = document.getElementById('savePidBtn');
    const saveStatus = document.getElementById('saveStatus');

    function setInputsFromState(state) {
      // Don't overwrite input the user is currently editing
      if (document.activeElement !== kpInput) kpInput.value = state.Kp != null ? state.Kp : '';
      if (document.activeElement !== kiInput) kiInput.value = state.Ki != null ? state.Ki : '';
      if (document.activeElement !== kdInput) kdInput.value = state.Kd != null ? state.Kd : '';
    }

    // Subscribe to appState updates if available
    if (window.appState && typeof window.appState.subscribe === 'function') {
      window.appState.subscribe(setInputsFromState);
    }

    function readInputs() {
      return {
        Kp: kpInput.value === '' ? null : Number(kpInput.value),
        Ki: kiInput.value === '' ? null : Number(kiInput.value),
        Kd: kdInput.value === '' ? null : Number(kdInput.value)
      };
    }

    // Send settings to device. Adjust URL if your endpoint is different.
    async function sendPidToDevice(payload) {
      saveStatus.textContent = 'Saving...';
      try {
        await fetch('http://esp32dev.local/set', {
          method: 'POST',
          mode: 'cors',
          credentials: 'omit',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        // update local observable so UI and other tabs reflect the change
        if (window.appState && typeof window.appState.set === 'function') {
          window.appState.set(payload);
        }
        saveStatus.textContent = 'Saved';
      } catch (e) {
        saveStatus.textContent = 'Save failed';
        console.error(e);
      } finally {
        setTimeout(() => { saveStatus.textContent = ''; }, 1500);
      }
    }

    // Save on button click (you can also wire up onblur if desired)
    saveBtn.addEventListener('click', () => {
      const payload = readInputs();
      sendPidToDevice(payload);
    });

    // Optional: allow Enter key to save while focusing an input
    [kpInput, kiInput, kdInput].forEach(inp => {
      inp.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          saveBtn.click();
        }
      });
    });
  }());

}



