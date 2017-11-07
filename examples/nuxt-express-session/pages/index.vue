<template lang="pug">

section.hello
  .box
    .content.has-text-centered
      p Hello, {{ username }}

      a.button.is-info( @click="signOut", :disabled="!formValid" )
        | Logout

    .content( v-if="hasError" )
      small {{ hasError }}

</template>

<script>

export default {

  data () {
    return {
      username: 'Default username',
      sending: false,
      hasError: null
    }
  },

  computed: {
    formValid () {
      return !this.sending
    }
  },

  asyncData (context) {
    // Avoid fat example
    if (context.isClient) {
      return window.location.reload()
    }

    return {
      username: context.req.session.user.username
    }
  },

  methods: {
    async signOut () {
      this.sending = true

      try {
        await this.$axios.post('/user/logout')
        window.location.reload()
      } catch (err) {
        console.error(err)
        this.hasError = err.stack
      }

      this.sending = false
    }
  }

}

</script>

<style lang="stylus" scoped>

.hello
  min-height: 100vh
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center

.box
  min-width: 250px
  border-radius: 0
  padding: 2.25em 2em
  margin: 2em 0

  @media screen and (max-width: 600px)
    box-shadow: none
    width: 100vw
    min-height: 100vh
    margin: 0

p
  font-size: 1.25em

.button
  margin-top: 1.25em

</style>
