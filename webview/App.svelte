<script>
  console.log("Hello");

  let ClientUrl = null;
  let ReportTemplateId = null;
  let ReportId = null;

  let DebugDate = null;

  function init() {
    vscode.postMessage({ command: "init" });
  }

  window.addEventListener("message", (event) => {
    console.log("Received Message: ", event);
    const message = event.data;
    switch (message.command) {
      case "setConfiguration":
        const configuration = JSON.parse(message.configuration);
        ClientUrl = configuration.ClientUrl;
        ReportTemplateId = configuration.ReportTemplateId;
        ReportId = configuration.ReportId;
        DebugDate = configuration.DebugDate;
        break;
    }
  });

  function execCommand(command) {
    vscode.postMessage({
      command: command,
      args: [],
    });
  }

  // tells the extension the webview finished loading and is listening for events
  init();
</script>

<div class="config-item">
  <div class="config-label">ClientUrl:</div>
  <div class="config-value">{ClientUrl}</div>

  <div class="icon-button" on:click={() => execCommand("setClientUrl")}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
      ><path d="M0 0h24v24H0z" fill="none" /><path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      /></svg
    >
  </div>
</div>

<div class="config-item">
  <div class="config-label">Template:</div>
  <div class="config-value">{ReportTemplateId}</div>

  <div class="icon-button" on:click={() => execCommand("setReportTemplateId")}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
      ><path d="M0 0h24v24H0z" fill="none" /><path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      /></svg
    >
  </div>
</div>

<div class="config-item">
  <div class="config-label">Report:</div>
  <div class="config-value">{ReportId}</div>

  <div class="icon-button" on:click={() => execCommand("setReportId")}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
      ><path d="M0 0h24v24H0z" fill="none" /><path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      /></svg
    >
  </div>
</div>

<div class="config-item" style="margin-top: 40px">
  <div class="config-label">Date:</div>

  <div class="config-value">{DebugDate}</div>

  <div class="icon-button" on:click={() => execCommand("setDebugDate")}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="24px"
      viewBox="0 0 24 24"
      width="24px"
      fill="#000000"
      ><path d="M0 0h24v24H0z" fill="none" /><path
        d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      /></svg
    >
  </div>
</div>

<button class="primary">Sign</button>
<button class="primary" on:click={() => execCommand("uploadRunCurrentFile")}>Upload & Run
</button>

<style>
  .config-item {
    width: 100%;
    display: flex;
    height: 25px;
  }

  .config-item .config-value {
    margin-left: auto;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .config-item .icon-button {
    visibility: hidden;
    margin-left: 8px;
  }

  .config-item .config-label {
    margin-right: 5px;
    font-weight: 700;
  }

  .config-item:hover .icon-button {
    visibility: visible;
  }
</style>
