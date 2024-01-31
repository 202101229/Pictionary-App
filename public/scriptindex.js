 validationfails = true;


        function submitForm(event){
            if(validationfails){
                event.preventDefault();
                alert('Username must be unique.');
            return false;
        }
        else  {
            let x = document.getElementById('nameInput').value;
            let y = document.getElementById('passwordInput').value;

            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

            if(x === ''){
                alert('Name must not to be a empty.')
                event.preventDefault();
                return false;
            }
            else if(y === ''){
                alert('Password must not to be a empty.')
                event.preventDefault();
                return false;
            }
            else  if(passwordRegex.test(y)){

                        console.log("Password is valid");
                        document.form.submit();
                        return true;
            }
            else {
                         console.log("Password is invalid");
                         event.preventDefault();
                         alert('Passowrd must contain one Upper case , one lower case , one digit and one special character and minimum lenght should be 8.');
                         return false;
                }
        }
        }

function checkuniq(){

   let x = document.getElementById('nameInput').value;

//    console.log(x);

   const url = '/checkuniq';
        const data = {
            username : x,
        };

        fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            // Add any additional headers if needed
        },
        body: JSON.stringify(data),
        })
        .then(response => response.json())
        .then(data => {
            if(data.sign === 0){

                validationfails = true;

                let y = document.getElementById('uniqueornot');

                y.style.display = 'block';

                let z = document.getElementById('uniqueornot2');

                z.style.display = 'none';

                

            }else{

                validationfails  = false;

                let y = document.getElementById('uniqueornot');

                y.style.display = 'none';

                let z = document.getElementById('uniqueornot2');

                z.style.display = 'block';

            }
        })
        .catch(error => {
            console.error('Error:', error);
        });


}

let selectedAvatar = 1;
document.getElementById("lab" + selectedAvatar).style.borderColor ="#00ff00"
document.getElementsByName("avatar").value = selectedAvatar;

function selectAvatar(avatarNumber) {
    document.getElementById("lab" + selectedAvatar).style.borderColor = "#000"
    selectedAvatar = avatarNumber;
    document.getElementById("lab" + avatarNumber).style.borderColor = "#00ff00"
    document.getElementsByName("avatar").value = avatarNumber;
}

function selectCustomAvatar(avatarNumber) {

            const fi = document.getElementById('userImageInput');
            const img = fi.value.split('.').pop().toLowerCase().toString();
            var imageExts = ['jpg', 'jpeg', 'png'];
            var maxSize = 1000 * 1024;
            var fileSize = fi.files[0].size;
            if (imageExts.indexOf(img) === -1) {
            fi.value = null
            if(selectedAvatar == 6) avatarNumber = 1;
            else                     avatarNumber = selectAvatar;
            document.getElementById("abc").src = "/images/upload.png";
            alert('Only jpg/jpeg and png files are allowed!');
            }
            else if (fi.files.length > 0) {
            console.log(img)
            if (fileSize > maxSize) {
                document.getElementById("abc").src = "/images/upload.png";
                fi.value = null;
                if(selectedAvatar === 6) avatarNumber = 1;
                 else avatarNumber = selectedAvatar;
                alert('File size exceeds 1 MB Please choose a smaller file.');
            }
            else {
                if (imageExts.indexOf(img) !== -1) {
                var image = URL.createObjectURL(event.target.files[0]);

                document.getElementById("abc").src = image;
                }
            }
            }

    document.getElementById("lab" + selectedAvatar).style.borderColor = "#000"
    selectedAvatar = avatarNumber;
    console.log(document.getElementsByName("avatar").value);
    document.getElementById("lab" + avatarNumber).style.borderColor = "#00ff00"
    document.getElementsByName("avatar").value = avatarNumber;

}