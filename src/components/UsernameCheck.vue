<template>
    <div>
        <input
            @keyup="checkUnique"
            type="text"
            :placeholder="msg"
            v-model="newUserName"
            title="Letters, numbers, _ and . only. 5-30 characters"
            required
        />
        <button
            v-if="!usernameExists && newUserName.length >= 5"
            @click="$emit('addthisuser', newUserName)"
        >Choose</button>
        <p
            v-if="!usernameExists && newUserName.length >= 5"
            style="color: green; font-size: smaller"
        >{{ newUserName }} is avaiable</p>
        <p
            v-if="usernameExists || newUserName.length < 5 && newUserName.length > 0"
            style="color: red;"
        >{{ newUserName }} is not avaiable</p>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { checkIfUserNameUnique } from '../firestore';

defineProps<{ msg: string }>() //this is unnecersarry. just testing props
defineEmits<{ (e: 'addthisuser', userName: string): void }>()

const newUserName = ref('');
const usernameExists = ref(false);
const pattern = /^([a-zA-Z0-9_.]){5,30}$/; //regex pattern

const checkUnique = async () => {
    //if statement to avoid calling the database for the first 4 characters
    if (pattern.test(newUserName.value)) {
        //tolowercase because all usernames saved in lower case. display name preserves case sensitivity
        await checkIfUserNameUnique(newUserName.value.toLowerCase()).then((result) => {
            usernameExists.value = result;
        })
    } else { usernameExists.value = true; }
}
</script>