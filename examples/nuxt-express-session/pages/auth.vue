<template lang="pug">

section.auth
  .box
    .content
      h3 Login

    form
      .field
        label.label
          | Username
        .control.has-icon-left
          input.input( v-model="username", placeholder="At least 4 characters" )

      .field.buttons
        .control.has-text-right
          a.button.is-info( @click="signIn", :disabled="!formValid" )
            | Continue

    .content( v-if="hasError" )
      small {{ hasError }}

</template>

<script>

export default {

  data () {
    return {
      username: '',
      sending: false,
      hasError: null
    }
  },

  computed: {
    formValid () {
      return !this.sending && this.username.length >= 4
    }
  },

  methods: {
    async signIn () {
      this.sending = true

      try {
        const { data } = await this.$axios.post('/user/login', {
          username: this.username
        })

        window.location.reload()
        // this.$nuxt.$router.push({ path: '/', query: data })
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

.auth
  min-height: 100vh
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center

.box
  min-width: 370px
  border-radius: 0
  padding: 2.25em 2em
  margin: 2em 0

  @media screen and (max-width: 600px)
    box-shadow: none
    width: 100vw
    min-height: 100vh
    margin: 0

  .field:last-child
    margin-top: 1.75em

  .label
    font-size: .85em

  .input
    border-radius: 0
    border-width: 0 0 2px 0
    box-shadow: none

  .buttons
    .button
      padding-left: 1.25em
      padding-right: 1.25em

</style>
