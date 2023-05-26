document.addEventListener('DOMContentLoaded', function() {
  
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', (event)=> { event.preventDefault(); return compose_email()});

 

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipients='',subject='', body='') {
  hide_email()
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
 
  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients instanceof Event ? '' : recipients;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
  document.querySelector('#compose-form').onsubmit  = (event)=>{event.preventDefault();return sendMail()};
  show_compose();
 return false

}

function sendMail(){
  // console.log('Called Mail')
  let recipients = document.querySelector('#compose-recipients').value;
  let subject = document.querySelector('#compose-subject').value;
  let body = document.querySelector('#compose-body').value;
  console.log("Sending email...")
  console.log(recipients, subject, body)

  return fetch('emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => {console.log(response);return response.json()} )
  .then(result => {
      // Print result
      console.log(result.message);
      alert(result.message)
      load_mailbox('sent')
  });

}

function hide_email(){
  document.getElementById('one-email-view').style.display = 'none'
}

function show_email(){
  document.getElementById('one-email-view').style.display = 'block'
}

function load_mailbox(mailbox) {
  hide_email()
  mailbox == 'archive' ? archive_string = 'unArchive' : archive_string = 'Archive'
  
  console.log(mailbox)
  fetch('/emails/'+mailbox)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    
    emails.map(
      (   (row, i)=> ( 

        mailbox != 'sent' ?
        document.querySelector('#emails-view').innerHTML += `<h5 style="border: 2px solid black; padding:5px"> <span onclick=load_email(${row['id']})> <b>${row['sender']}</b> <span style="margin-left:25px; font-weight:400">${row['subject']}</span> <span style="font-weight:50px; float:right; margin-left:20px;color:grey; font-weight:lighter" >${row['timestamp']}</span>  </span> 
        <span style="float:right" onclick="${archive_string.toLowerCase()}(${row['id']})" id="archive">${archive_string}</span>  
        </h5>` : 
        
        document.querySelector('#emails-view').innerHTML += `<h5 style="border: 2px solid black; padding:5px"> <span onclick=load_email(${row['id']})> <b>${row['sender']}</b> <span style="margin-left:25px; font-weight:400">${row['subject']}</span> <span style="font-weight:50px; float:right; margin-left:20px;color:grey; font-weight:lighter" >${row['timestamp']}</span>  </span> 
       
        </h5>`
       ) )
    )
   
    
    // ... do something else with emails ...
});
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-view').innerHTML = '<p>Hello!</p>';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}

function hide_compose(){
  document.getElementById('compose-view').style.display = 'none';
}

function show_compose(){
  document.getElementById('compose-view').style.display = 'block';
}

function archive(email_id){
  console.log('called')
  fetch('/emails/'+email_id,  {method: 'PUT',
  body: JSON.stringify({
    archived: true
})
}
  ).then(()=>{alert('Archived Email'); load_mailbox('inbox') }).catch(e=>console.log(e))
}

function unarchive(email_id){
  console.log('called')
  fetch('/emails/'+email_id,  {method: 'PUT',
  body: JSON.stringify({
    archived: false
})
}
  ).then(
    ()=>{alert('Unarchived Email'); load_mailbox('inbox') }
    ).catch(e=>console.log(e))
}

function load_email(email_id){
  document.querySelector('#emails-view').style.display = 'none';
  document.getElementById('compose-view').style.display = 'none';
  show_email()
  hide_compose()


  fetch('/emails/'+email_id)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    
    console.log(emails);
    document.querySelector('#from').innerHTML = emails.sender;
    document.querySelector('#to').innerHTML = emails.recipients.join(', ');
    document.querySelector('#subject').innerHTML = emails.subject;
    document.querySelector('#content').innerHTML = emails.body;
    document.querySelector('#timestamp').innerHTML = emails.timestamp;
    let subject = ''
    emails.subject.includes('Re: ') || emails.subject.includes('Re:') ? subject = emails.subject : subject= 'Re: '+emails.subject
    let emailbody = `On ${emails.timestamp} ${emails.sender} wrote: ${emails.body}`
    document.querySelector('#reply').addEventListener('click', (event)=>{event.preventDefault(); compose_email(emails.sender, subject, emailbody)}  );

    
   
    
    // ... do something else with emails ...
});


}